const RETURN_KEY = "civify_auth_return";

/** Only same-site paths may be resumed after login, signup, verification or SSO. */
export function safeReturnTo(value: string | null | undefined): string | null {
  if (!value || value.length > 2048 || !value.startsWith("/") || value.startsWith("//")) return null;
  let decoded = value;
  try {
    for (let i = 0; i < 3; i++) {
      if (/[\\\u0000-\u0020]/.test(decoded) || decoded.startsWith("//")) return null;
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
    if (/[\\\u0000-\u0020]/.test(decoded) || decoded.startsWith("//")) return null;
    return new URL(value, "https://civify.invalid").origin === "https://civify.invalid" ? value : null;
  } catch { return null; }
}

export function rememberAuthReturn(value: string | null): void {
  const path = safeReturnTo(value);
  if (path) try { localStorage.setItem(RETURN_KEY, JSON.stringify({ path, expires: Date.now() + 30 * 60_000 })); } catch {}
}

export function readAuthReturn(): string | null {
  try {
    const saved = JSON.parse(localStorage.getItem(RETURN_KEY) || "null");
    if (saved?.expires > Date.now()) return safeReturnTo(saved.path);
    localStorage.removeItem(RETURN_KEY);
  } catch {}
  return null;
}

export function clearAuthReturn(): void { try { localStorage.removeItem(RETURN_KEY); } catch {} }

export function accountLinkRedirect(value: string): string {
  const url = new URL(value);
  const origin = new URL(process.env.NEXT_PUBLIC_MCP_ORIGIN || "https://mcp.civify.cv").origin;
  if (url.origin !== origin || url.username || url.password || url.hash || url.pathname !== "/oauth/complete") {
    throw new Error("Invalid account-link destination. Reconnect from your AI client.");
  }
  return url.href;
}
