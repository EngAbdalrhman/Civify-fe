import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

const API_ROOT_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8077";
const FINAL_BASE_URL = `${API_ROOT_URL.replace("/apis", "")}/apis`;

/**
 * API Client with automatic locale header injection
 * This client automatically adds the Accept-Language header based on the current locale
 */
import { STORAGE_KEYS } from "./api/config";

// ... imports

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      // Use the consistently defined base URL
      baseURL: FINAL_BASE_URL, 
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Ensure cookies are sent with every request
    });

    // Request interceptor to add Accept-Language header
    this.instance.interceptors.request.use(
      (config) => {
        // Get locale from window global (set by LocaleProvider)
        const locale =
          typeof window !== "undefined"
            ? (window as any).__LOCALE__ || "en"
            : "en";

        // Add Accept-Language header
        config.headers["Accept-Language"] = locale;

        // Add Authorization header if token exists
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Handle 401 Unauthorized - token expired
        if (error.response?.status === 401) {
          // Avoid infinite loop if the refresh endpoint itself returns 401
          if (error.config?.url?.includes("/auth/refresh")) {
             localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
             localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
             localStorage.removeItem(STORAGE_KEYS.USER_DATA);
             
             // Clear cookies
             document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
             
             window.location.href = "/login";
             return Promise.reject(error);
          }

          // Try to refresh token (relying on HttpOnly cookie)
          try {
             // Use the correct backend endpoint
             const response = await axios.post(
                `${FINAL_BASE_URL}/auth/refresh`,
                {}, // Empty body
                { withCredentials: true } // Ensure cookies are sent
             );
             
             // Parse JSON body (backend returns {accessToken, refreshToken})
             const { accessToken, refreshToken } = response.data;
             
             if (accessToken) {
                // Update localStorage
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                if (refreshToken) {
                   localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
                }
                
                // Also update tokenManager for consistency
                const { tokenManager } = require("@/lib/api/token-manager");
                tokenManager.setTokens(accessToken, refreshToken || "", 900000); // 15 min in ms
                
                // Retry original request
                if (error.config) {
                    error.config.headers.Authorization = `Bearer ${accessToken}`;
                    return this.instance.request(error.config);
                }
             } else {
                throw new Error("No access token in refresh response");
             }
          } catch (refreshError) {
              // Refresh failed, logout
              console.error("Token refresh failed:", refreshError);
              
              // Clear localStorage
              localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.USER_DATA);
              
              // Clear cookies
              document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              
              window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    // Note: The caller expects response.data, which is handled here.
    return response.data; 
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Get the underlying axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances if needed
export default ApiClient;