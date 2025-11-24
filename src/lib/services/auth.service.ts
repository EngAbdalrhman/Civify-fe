import { apiClient } from "../api-client";

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  [key: string]: any;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

class AuthService {
  private readonly TOKEN_KEY = "authToken";
  private readonly REFRESH_TOKEN_KEY = "refreshToken";

  /**
   * Login with email and password
   */
  async login(data: any): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  /**
   * Register new user
   */
  async register(data: any): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    // Note: Registration might not return tokens immediately if verification is required
    // Adjust based on actual backend response
    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post("/auth/logout", null, {
          params: { refreshToken },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearTokens();
      window.location.href = "/login";
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await apiClient.post<AuthResponse>("/auth/refresh", null, {
        params: { refreshToken },
      });
      this.setTokens(response.accessToken, response.refreshToken);
      return response.accessToken;
    } catch (error) {
      this.clearTokens();
      return null;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/users/me");
  }

  /**
   * Initiate Google OAuth2 Login
   */
  loginWithGoogle() {
    // Redirect to backend OAuth2 endpoint
    // The backend will handle the handshake with Google and redirect back to frontend
    // with tokens (usually in URL query params or set in cookies if we were using cookies)
    // Since we are using tokens, we expect the backend to redirect to a frontend callback page
    // with tokens in the URL, e.g., /auth/callback?token=...&refreshToken=...
    // OR, if the backend sets cookies, we might need to extract them.
    // Given the plan is Token-based, let's assume the backend redirects with query params.
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
  }

  // Token Management

  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  clearTokens() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
