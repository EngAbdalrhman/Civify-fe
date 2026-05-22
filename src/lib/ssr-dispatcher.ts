/**
 * SSR DNS bypass for civify hosts.
 *
 * Why: Dokploy Swarm containers ship with broken DNS (resolv.conf → 127.0.0.1 only)
 * and Swarm `host-add` writes to /etc/hosts as root-only, so the nextjs user
 * cannot read it. Both make every SSR fetch to civify.cv / stg.civify.cv throw
 * `getaddrinfo EAI_AGAIN`.
 *
 * Fix: install a global undici dispatcher that overrides the connect step for
 * known civify hosts. TLS SNI still uses the real hostname so cert validation
 * works. Other fetches fall through to the OS resolver unchanged.
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
    map.set(host, ip);
  }

  const envMap = process.env.BLOG_SSR_HOST_MAP;
  if (envMap) {
    for (const pair of envMap.split(",")) {
      const [host, ip] = pair.split("=").map((s) => s.trim());
      if (host && ip) map.set(host, ip);
    }
  }

  const singleHost = process.env.BLOG_SSR_HOST_HEADER?.trim();
  const singleIp = process.env.BLOG_SSR_TARGET_IP?.trim();
  if (singleHost && singleIp) {
    map.set(singleHost, singleIp);
  }

  return map;
}

export async function installSsrDispatcher(): Promise<void> {
  if (installed) return;
  if (typeof window !== "undefined") return;
  if (process.env.BLOG_SSR_DISPATCHER === "false") return;

  try {
    const undici = await import("undici");
    if (
      typeof undici.setGlobalDispatcher !== "function" ||
      typeof undici.Agent !== "function"
    ) {
      return;
    }

    const map = buildHostMap();

    const agent = new undici.Agent({
      connect: {
        lookup(
          hostname: string,
          options: dns.LookupOptions,
          callback: (
            err: NodeJS.ErrnoException | null,
            address: string,
            family: number,
          ) => void,
        ) {
          const overrideIp = map.get(hostname);
          if (overrideIp) {
            callback(null, overrideIp, 4);
            return;
          }
          dns.lookup(hostname, options, callback as never);
        },
      },
    });

    undici.setGlobalDispatcher(agent);
    installed = true;

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[SSR Dispatcher] installed with overrides: ${Array.from(map.entries())
          .map(([h, i]) => `${h}=${i}`)
          .join(", ")}`,
      );
    }
  } catch (error) {
    console.warn("[SSR Dispatcher] failed to install:", error);
  }
}
