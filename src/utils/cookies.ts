/**
 * Cookie utility functions for handling authentication tokens
 * This provides a centralized way to manage cookies across the application
 */

const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

/**
 * Set a cookie with the given options
 */
export const setCookie = (
  name: string,
  value: string,
  options: {
    path?: string;
    maxAge?: number;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
  } = {},
): void => {
  if (typeof document === "undefined") return;

  const { path = "/", maxAge, secure = true, sameSite = "Lax" } = options;

  let cookieString = `${name}=${value}; path=${path}; SameSite=${sameSite}`;

  if (maxAge !== undefined) {
    cookieString += `; max-age=${maxAge}`;
  }

  if (secure && window.location.protocol === "https:") {
    cookieString += "; Secure";
  }

  document.cookie = cookieString;
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (name: string): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

// ============================================
// Access Token specific helpers
// ============================================

/**
 * Get the access token from cookies
 */
export const getAccessToken = (): string | null => {
  return getCookie(ACCESS_TOKEN_COOKIE_NAME);
};

/**
 * Set the access token cookie
 * @param token - The access token value
 * @param maxAge - Token lifetime in seconds (default: 900 = 15 minutes)
 */
export const setAccessToken = (token: string, maxAge: number = 900): void => {
  setCookie(ACCESS_TOKEN_COOKIE_NAME, token, {
    path: "/",
    maxAge,
    secure: true,
    sameSite: "Lax",
  });
};

/**
 * Delete the access token cookie
 */
export const deleteAccessToken = (): void => {
  deleteCookie(ACCESS_TOKEN_COOKIE_NAME);
};

// ============================================
// Refresh Token specific helpers
// ============================================

/**
 * Get the refresh token from cookies (if not httpOnly)
 */
export const getRefreshToken = (): string | null => {
  return getCookie(REFRESH_TOKEN_COOKIE_NAME);
};

/**
 * Delete the refresh token cookie
 */
export const deleteRefreshToken = (): void => {
  deleteCookie(REFRESH_TOKEN_COOKIE_NAME);
};

// ============================================
// Auth state helpers
// ============================================

/**
 * Check if user is authenticated (has access token)
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

/**
 * Clear all auth tokens (access and refresh)
 */
export const clearAuthTokens = (): void => {
  deleteAccessToken();
  deleteRefreshToken();
};

// Export cookie names for reference
export const COOKIE_NAMES = {
  ACCESS_TOKEN: ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN: REFRESH_TOKEN_COOKIE_NAME,
} as const;
