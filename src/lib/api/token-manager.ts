/**
 * Token Manager
 * Handles secure storage and management of JWT tokens
 */

import { STORAGE_KEYS, TOKEN_REFRESH_THRESHOLD } from './config';

/**
 * Token data structure
 */
interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

/**
 * Token Manager Class
 * Provides methods for storing, retrieving, and managing JWT tokens
 */
class TokenManager {
  private static instance: TokenManager;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Store tokens securely
   */
  public setTokens(accessToken: string, refreshToken: string, expiresIn?: number): void {
    try {
      // Calculate expiry time (default to 1 hour if not provided)
      const expiresInMs = expiresIn || 3600000; // 1 hour in milliseconds
      const expiresAt = Date.now() + expiresInMs;

      // Store in localStorage (consider using httpOnly cookies in production)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString());
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Get access token
   */
  public getAccessToken(): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  public getRefreshToken(): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  /**
   * Get token expiry time
   */
  public getTokenExpiry(): number | null {
    try {
      if (typeof window !== 'undefined') {
        const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
        return expiry ? parseInt(expiry, 10) : null;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving token expiry:', error);
      return null;
    }
  }

  /**
   * Check if access token is expired or about to expire
   */
  public isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;

    const now = Date.now();
    return now >= expiry;
  }

  /**
   * Check if token needs refresh (within threshold)
   */
  public needsRefresh(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;

    const now = Date.now();
    return (expiry - now) <= TOKEN_REFRESH_THRESHOLD;
  }

  /**
   * Clear all tokens
   */
  public clearTokens(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!(accessToken && refreshToken && !this.isTokenExpired());
  }

  /**
   * Get all token data
   */
  public getTokenData(): TokenData | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const expiresAt = this.getTokenExpiry();

    if (!accessToken || !refreshToken || !expiresAt) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  /**
   * Decode JWT token (without verification)
   * Used for extracting user info from token
   */
  public decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get user ID from access token
   */
  public getUserId(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.sub ? parseInt(decoded.sub, 10) : null;
  }

  /**
   * Get user role from access token
   */
  public getUserRole(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.role || null;
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user is admin
   */
  public isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  /**
   * Check if user is licensed
   */
  public isLicensedUser(): boolean {
    return this.hasRole('ROLE_LICENSED_USER') || this.isAdmin();
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();

// Export class for testing purposes
export { TokenManager };

