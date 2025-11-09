/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from '../client';
import { tokenManager } from '../token-manager';
import { API_ENDPOINTS } from '../config';
import {
  AuthRequest,
  AuthResponse,
  VerifyOtpRequest,
  ApiResponse,
} from '../types';

/**
 * Authentication Service Class
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(data: AuthRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );

    // Store tokens if registration is successful
    if (response.accessToken && response.refreshToken) {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  /**
   * Login with email/username and password
   */
  async login(data: AuthRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );

    // Store tokens if login is successful and 2FA is not required
    if (response.accessToken && response.refreshToken && !response.requires2FA) {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  /**
   * Verify 2FA OTP code
   */
  async verifyOtp(username: string, code: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      null,
      {
        params: { username, code },
      }
    );

    // Store tokens after successful 2FA verification
    if (response.accessToken && response.refreshToken) {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  /**
   * Refresh access token
   */
  async refresh(): Promise<AuthResponse> {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      null,
      {
        params: { refreshToken },
      }
    );

    // Update stored tokens
    if (response.accessToken && response.refreshToken) {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken();

    if (refreshToken) {
      try {
        await apiClient.post<ApiResponse>(
          API_ENDPOINTS.AUTH.LOGOUT,
          null,
          {
            params: { refreshToken },
          }
        );
      } catch (error) {
        console.error('Logout API call failed:', error);
        // Continue with local logout even if API call fails
      }
    }

    // Clear local tokens
    tokenManager.clearTokens();
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse> {
    return await apiClient.get<ApiResponse>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      {
        params: { token },
      }
    );
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<ApiResponse> {
    return await apiClient.post<ApiResponse>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      null,
      {
        params: { email },
      }
    );
  }

  /**
   * Enable 2FA for user
   */
  async enable2FA(): Promise<ApiResponse> {
    return await apiClient.post<ApiResponse>(
      API_ENDPOINTS.AUTH.ENABLE_2FA
    );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  }

  /**
   * Get current user ID from token
   */
  getCurrentUserId(): number | null {
    return tokenManager.getUserId();
  }

  /**
   * Get current user role from token
   */
  getCurrentUserRole(): string | null {
    return tokenManager.getUserRole();
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return tokenManager.isAdmin();
  }

  /**
   * Check if current user is licensed
   */
  isLicensedUser(): boolean {
    return tokenManager.isLicensedUser();
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };

