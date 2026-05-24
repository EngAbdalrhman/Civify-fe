const STORAGE_KEY = "civify:permissions:v1";

export interface CachedPermissionsData {
  permissions: string[];
  groupName: string | null;
}

interface StoredPermissionsEntry extends CachedPermissionsData {
  tokenKey: string;
}

/** Stable fingerprint for the current access token (not for security). */
export function getTokenKey(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = (hash << 5) - hash + token.charCodeAt(i);
    hash |= 0;
  }
  return `${token.length}:${Math.abs(hash).toString(16)}`;
}

export function readCachedPermissions(
  token: string,
): CachedPermissionsData | null {
  if (typeof window === "undefined" || !token) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPermissionsEntry;
    if (parsed.tokenKey !== getTokenKey(token)) return null;
    return {
      permissions: parsed.permissions ?? [],
      groupName: parsed.groupName ?? null,
    };
  } catch {
    return null;
  }
}

export function writeCachedPermissions(
  token: string,
  data: CachedPermissionsData,
): void {
  if (typeof window === "undefined" || !token) return;
  try {
    const entry: StoredPermissionsEntry = {
      tokenKey: getTokenKey(token),
      permissions: data.permissions,
      groupName: data.groupName,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

export function clearCachedPermissions(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
