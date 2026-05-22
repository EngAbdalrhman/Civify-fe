/**
 * SSR DNS bypass for civify hosts + global DNS resilience.
 *
 * Why: Dokploy Swarm containers ship with broken DNS (resolv.conf -> 127.0.0.1
 * only) so every SSR fetch (civify API, Unsplash, ImageKit, ...) can throw
 * `getaddrinfo EAI_AGAIN`. The result: blogs flicker out, cover images fail to
 * load, and slug pages 500.
 *
 * Fix: monkey-patch `dns.lookup` / `dns.promises.lookup` so that:
 *   1. Known civify hosts resolve directly to the Traefik IP (no DNS at all).
 *   2. All other hosts fall back to Cloudflare/Google DNS via `dns.resolve4`
 *      when the system resolver fails. This makes Unsplash, ImageKit, GA, etc.
 *      all work even when the container's resolv.conf is broken.
 *
 * TLS SNI still uses the real hostname so certificates validate.
 *
 * Installed from `instrumentation.ts` at server boot, before any other module
 * captures a reference to `dns.lookup`.
 *
 * Env overrides:
 *   BLOG_SSR_HOST_MAP="host1=ip1,host2=ip2"  (extra static overrides)
 *   BLOG_SSR_HOST_HEADER + BLOG_SSR_TARGET_IP (single pair)
 *   BLOG_SSR_FALLBACK_DNS="1.1.1.1,8.8.8.8"  (default Cloudflare + Google)
 *   BLOG_SSR_DISPATCHER="false"              (disable entirely)
 */

import dns from "node:dns";

let installed = false;

const DEFAULT_HOST_MAP: Record<string, string> = {
  "civify.cv": "34.44.205.35",
  "stg.civify.cv": "34.44.205.35",
};

const DEFAULT_FALLBACK_DNS = ["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"];

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

function getFallbackResolver(): dns.promises.Resolver {
  const servers = (
    process.env.BLOG_SSR_FALLBACK_DNS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) || DEFAULT_FALLBACK_DNS
  );
  const resolver = new dns.promises.Resolver({ timeout: 3000, tries: 2 });
  try {
    resolver.setServers(servers);
  } catch {
    resolver.setServers(DEFAULT_FALLBACK_DNS);
  }
  return resolver;
}

const negativeCache = new Map<string, number>();
const NEGATIVE_TTL_MS = 30_000;
const positiveCache = new Map<string, { ip: string; family: number; expires: number }>();
const POSITIVE_TTL_MS = 60_000;

async function resolveViaFallback(
  hostname: string,
): Promise<{ address: string; family: number } | null> {
  const cached = positiveCache.get(hostname);
  if (cached && cached.expires > Date.now()) {
    return { address: cached.ip, family: cached.family };
  }
  const negativeAt = negativeCache.get(hostname);
  if (negativeAt && Date.now() - negativeAt < NEGATIVE_TTL_MS) {
    return null;
  }

  try {
    const resolver = getFallbackResolver();
    const v4 = await resolver.resolve4(hostname).catch(() => [] as string[]);
    if (v4.length > 0) {
      const ip = v4[0];
      positiveCache.set(hostname, {
        ip,
        family: 4,
        expires: Date.now() + POSITIVE_TTL_MS,
      });
      return { address: ip, family: 4 };
    }
    const v6 = await resolver.resolve6(hostname).catch(() => [] as string[]);
    if (v6.length > 0) {
      const ip = v6[0];
      positiveCache.set(hostname, {
        ip,
        family: 6,
        expires: Date.now() + POSITIVE_TTL_MS,
      });
      return { address: ip, family: 6 };
    }
  } catch {
    // ignore
  }
  negativeCache.set(hostname, Date.now());
  return null;
}

function isTransientDnsError(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code ?? "";
  return (
    code === "EAI_AGAIN" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "ESERVFAIL"
  );
}

export function installSsrDispatcher(): void {
  if (installed) return;
  if (typeof window !== "undefined") return;
  if (process.env.BLOG_SSR_DISPATCHER === "false") return;

  const map = buildHostMap();
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

    if (!callback) {
      return (originalLookup as (...a: unknown[]) => unknown).apply(dns, args);
    }

    const ip = resolveOverride(hostname);
    if (ip) {
      if (options.all) {
        callback(null, [{ address: ip, family: 4 }]);
      } else {
        callback(null, ip, 4);
      }
      return;
    }

    // Try the system resolver first, fall back to Cloudflare/Google on EAI_AGAIN.
    (originalLookup as (...a: unknown[]) => unknown).call(
      dns,
      hostname,
      options,
      (err: unknown, addr: unknown, family: unknown) => {
        if (!err) {
          callback(err, addr, family);
          return;
        }
        if (!isTransientDnsError(err)) {
          callback(err);
          return;
        }
        if (typeof hostname !== "string") {
          callback(err);
          return;
        }
        resolveViaFallback(hostname).then((result) => {
          if (!result) {
            callback(err);
            return;
          }
          if (options.all) {
            callback(null, [{ address: result.address, family: result.family }]);
          } else {
            callback(null, result.address, result.family);
          }
        });
      },
    );
  };

  const patchedLookupPromise = async function patchedLookupPromise(
    hostname: string,
    options?: unknown,
  ): Promise<unknown> {
    const all =
      typeof options === "object" &&
      options !== null &&
      (options as { all?: boolean }).all === true;

    const ip = resolveOverride(hostname);
    if (ip) {
      if (all) return [{ address: ip, family: 4 }];
      return { address: ip, family: 4 };
    }

    try {
      const result = await (
        originalLookupPromise as unknown as (
          h: string,
          o?: unknown,
        ) => Promise<unknown>
      ).call(dns.promises, hostname, options);
      return result;
    } catch (error) {
      if (!isTransientDnsError(error)) throw error;
      const fallback = await resolveViaFallback(hostname);
      if (!fallback) throw error;
      if (all) {
        return [{ address: fallback.address, family: fallback.family }];
      }
      return { address: fallback.address, family: fallback.family };
    }
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

  console.log(
    `[SSR Dispatcher] installed. overrides=${Array.from(map.entries())
      .map(([h, i]) => `${h}=${i}`)
      .join(",")} fallback=${
      process.env.BLOG_SSR_FALLBACK_DNS || DEFAULT_FALLBACK_DNS.join(",")
    }`,
  );
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
