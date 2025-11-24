import { apiClient } from "../api-client";
import { STORAGE_KEYS } from "../api/config";

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
 
  private readonly EMAIL_REGEX = new RegExp(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  );

  /**
   * Helper function to check if a string matches the email pattern.
   * @param input The string to validate.
   * @returns boolean
   */
  private isEmail(input: string): boolean {
    if (!input) return false;
    return this.EMAIL_REGEX.test(input);
  }


  /**
   * Login with email/username and password
   */
  async login(data: any): Promise<void> {
    // Backend expects 'username' field even if it's an email
    if (this.isEmail(data.username)) {
      data.email = data.username;
      data.username = null;
    }

    const identifier = data.email || data.username;

    if (!identifier) {
      throw new Error("Username or email identifier is required.");
    }
    
    // The backend expects a unified field (like 'username') regardless of whether it's an email or username.
    const payload = {
      username: identifier, // Send the detected identifier (email or username)
      password: data.password
    };

    const response = await apiClient.getAxiosInstance().post("/generate-token", payload);
    
    // Extract token from Authorization header
    const authHeader = response.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      this.setAccessToken(token);
    } else {
      throw new Error("No access token received");
    }
  }

  /**
   * Register new user
   */
  async register(data: any): Promise<any> {
    const response = await apiClient.post("/auth/register", data);
    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
        // Optional: Call backend to clear cookies if needed, though usually client-side clear is enough for JWT
        // await apiClient.post("/auth/logout"); 
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
    try {
      // The refresh token is in an HttpOnly cookie, so we just make the request
      const response = await apiClient.getAxiosInstance().post("/refresh-token");
      
      const authHeader = response.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        this.setAccessToken(token);
        return token;
      }
      return null;
    } catch (error) {
      this.clearTokens();
      return null;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("v1/users/me");
    return response;
  }

  /**
   * Initiate Google OAuth2 Login
   */
  loginWithGoogle() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
  }

  // Token Management

  setAccessToken(accessToken: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
    return null;
  }

  clearTokens() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
