/** Same shape as @sentry/nextjs tunnel query string (org / project / optional region). */
const DSN_TUNNEL_RE = /@o(\d+)\.ingest(?:\.([a-z]{2}))?\.sentry\.io\/(\d+)/;

function tunnelDisabled(): boolean {
  const v = process.env.NEXT_PUBLIC_SENTRY_TUNNEL?.toLowerCase();
  return v === "0" || v === "false" || v === "off";
}

/**
 * Builds the browser `tunnel` URL so events POST to our App Route instead of relying on
 * `withSentryConfig` rewrites (those often 500 on POST in standalone / behind proxies).
 *
 * Set `NEXT_PUBLIC_SENTRY_TUNNEL=0` to send events from the browser straight to Sentry
 * (use when the server cannot reach ingest, e.g. broken IPv6 / firewall).
 */
export function sentryBrowserTunnelPath(
  dsn: string | undefined,
  tunnelRoute = "/monitoring",
): string | undefined {
  if (tunnelDisabled()) return undefined;
  if (!dsn) return undefined;
  const m = dsn.match(DSN_TUNNEL_RE);
  if (!m) return undefined;
  const [, orgId, region, projectId] = m;
  let path = `${tunnelRoute}?o=${orgId}&p=${projectId}`;
  if (region) path += `&r=${region}`;
  return path;
}
