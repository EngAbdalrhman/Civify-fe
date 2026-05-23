export const CIVIFY_SESSION_UPDATED = "civify:session-updated";

/** Notify the app that auth/subscription/permissions may have changed. */
export function dispatchSessionUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CIVIFY_SESSION_UPDATED));
  window.dispatchEvent(new Event("auth-state-changed"));
}
