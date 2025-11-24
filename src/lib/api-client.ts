import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

/**
 * API Client with automatic locale header injection
 * This client automatically adds the Accept-Language header based on the current locale
 */
class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8077/api",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
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
        const token = localStorage.getItem("authToken");
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
          // Try to refresh token
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                null,
                {
                  params: { refreshToken },
                }
              );
              const { accessToken: token, refreshToken: newRefreshToken } = response.data;
              localStorage.setItem("authToken", token);
              if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
              }

              // Retry the original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${token}`;
                return this.instance.request(error.config);
              }
            } catch (refreshError) {
              // Refresh failed, logout user
              localStorage.removeItem("authToken");
              localStorage.removeItem("refreshToken");
              window.location.href = "/login";
            }
          } else {
            // No refresh token, redirect to login
            localStorage.removeItem("authToken");
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

