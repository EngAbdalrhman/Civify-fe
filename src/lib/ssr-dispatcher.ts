/**
 * SSR DNS bypass for civify hosts.
 *
 * Why: Dokploy Swarm containers ship with broken DNS (resolv.conf -> 127.0.0.1
 * only) and Swarm host-add writes /etc/hosts as root-only, so the nextjs user
 * cannot read it. Every SSR fetch to civify.cv / stg.civify.cv throws
 * `getaddrinfo EAI_AGAIN`.
 *
 * Fix: monkey-patch Node's `dns.lookup` and `dns.promises.lookup` so the known
 * civify hosts resolve to the Traefik public IP without touching DNS. TLS SNI
 * still uses the real hostname so the cert validates. ANY code path that uses
 * `dns.lookup` benefits (Node native fetch, undici, http/https).
 *
 * Called from `instrumentation.ts` at server boot, before any module captures
 * a reference to the original `dns.lookup`.
 *
 * Override map precedence:
 *   1. BLOG_SSR_HOST_MAP = "host1=ip1,host2=ip2"
 *   2. BLOG_SSR_HOST_HEADER + BLOG_SSR_TARGET_IP (single pair)
 *   3. Built-in defaults (civify Traefik IP)
 */

import dns from "node:dns";

let installed = false;

const DEFAULT_HOST_MAP: Record<string, string> = {
  "civify.cv": "34.44.205.35",
  "stg.civify.cv": "34.44.205.35",
};

function buildHostMap(): Map<string, string> {
  const map = new Map<string, string>();

  for (const [host, ip] of Object.entries(DEFAULT_HOST_MAP)) {
    map.set(host.toLowerCase(), ip);
  }

  const envMap = process.env.BLOG_SSR_HOST_MAP;
  if (envMap) {
    for (const pair of envMap.split(",")) {
      const [host, ip] = pair.split("=").map((s) => s.trim());
      if (host && ip) map.set(host.toLowerCase(), ip);
    }
  }

  const singleHost = process.env.BLOG_SSR_HOST_HEADER?.trim();
  const singleIp = process.env.BLOG_SSR_TARGET_IP?.trim();
  if (singleHost && singleIp) {
    map.set(singleHost.toLowerCase(), singleIp);
  }

  return map;
}

export function installSsrDispatcher(): void {
  if (installed) return;
  if (typeof window !== "undefined") return;
  if (process.env.BLOG_SSR_DISPATCHER === "false") return;

  const map = buildHostMap();
  if (map.size === 0) return;

  installed = true;

  const originalLookup = dns.lookup;
  const originalLookupPromise = dns.promises.lookup;

  const resolveOverride = (hostname: unknown): string | undefined => {
    if (typeof hostname !== "string") return undefined;
    return map.get(hostname.toLowerCase());
  };

  const patchedLookup = function patchedLookup(
    this: unknown,
    ...args: unknown[]
  ): unknown {
    const hostname = args[0];
    let options: Record<string, unknown> = {};
    let callback: ((...cbArgs: unknown[]) => void) | undefined;

    if (typeof args[1] === "function") {
      callback = args[1] as (...cbArgs: unknown[]) => void;
    } else if (typeof args[2] === "function") {
      callback = args[2] as (...cbArgs: unknown[]) => void;
      if (typeof args[1] === "number") {
        options = { family: args[1] };
      } else if (typeof args[1] === "object" && args[1] !== null) {
        options = args[1] as Record<string, unknown>;
      }
    }

    const ip = resolveOverride(hostname);
    if (ip && callback) {
      if (options.all) {
        callback(null, [{ address: ip, family: 4 }]);
      } else {
        callback(null, ip, 4);
      }
      return;
    }

    return (originalLookup as (...a: unknown[]) => unknown).apply(dns, args);
  };

  const patchedLookupPromise = async function patchedLookupPromise(
    hostname: string,
    options?: unknown,
  ): Promise<unknown> {
    const ip = resolveOverride(hostname);
    if (ip) {
      const all =
        typeof options === "object" &&
        options !== null &&
        (options as { all?: boolean }).all === true;
      if (all) {
        return [{ address: ip, family: 4 }];
      }
      return { address: ip, family: 4 };
    }
    return (
      originalLookupPromise as unknown as (
        h: string,
        o?: unknown,
      ) => Promise<unknown>
    ).call(dns.promises, hostname, options);
  };

  try {
    Object.defineProperty(dns, "lookup", {
      configurable: true,
      writable: true,
      value: patchedLookup,
    });
    Object.defineProperty(dns.promises, "lookup", {
      configurable: true,
      writable: true,
      value: patchedLookupPromise,
    });
  } catch (error) {
    installed = false;
    console.warn("[SSR Dispatcher] failed to patch dns.lookup:", error);
    return;
  }

  void installUndiciDispatcher(map);

  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[SSR Dispatcher] installed for: ${Array.from(map.entries())
        .map(([h, i]) => `${h}=${i}`)
        .join(", ")}`,
    );
  }
}

async function installUndiciDispatcher(
  map: Map<string, string>,
): Promise<void> {
  try {
    const undici = (await import("undici")) as unknown as {
      Agent?: new (opts: unknown) => unknown;
      setGlobalDispatcher?: (d: unknown) => void;
    };
    if (!undici.Agent || !undici.setGlobalDispatcher) return;

    const agent = new undici.Agent({
      connect: {
        lookup(
          hostname: string,
          options: { all?: boolean; family?: number } | undefined,
          callback: (
            err: NodeJS.ErrnoException | null,
            address: string | { address: string; family: number }[],
            family?: number,
          ) => void,
        ) {
          const ip = map.get(String(hostname).toLowerCase());
          if (ip) {
            if (options?.all) {
              callback(null, [{ address: ip, family: 4 }]);
            } else {
              callback(null, ip, 4);
            }
            return;
          }
          dns.lookup(hostname, (options ?? {}) as never, callback as never);
        },
      },
    });
    undici.setGlobalDispatcher(agent);
  } catch {
    // Optional layer; ignore if undici is not available or fails.
  }
}
