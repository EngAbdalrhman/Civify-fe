/**
 * API Client
 * Axios-based HTTP client with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_URL, REQUEST_TIMEOUT, HTTP_STATUS, API_ERROR_CODES, CONTENT_TYPES } from './config';
import { tokenManager } from './token-manager';
import { ApiException, ApiError } from './types';

/**
 * Create axios instance with default configuration
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': CONTENT_TYPES.JSON,
      'Accept': CONTENT_TYPES.JSON,
    },
  });

  return instance;
};

/**
 * API Client Class
 * Provides HTTP methods with automatic token management and error handling
 */
class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.axiosInstance = createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Skip token for auth endpoints
        if (this.isAuthEndpoint(config.url || '')) {
          return config;
        }

        // Get access token
        const accessToken = tokenManager.getAccessToken();

        // Check if token needs refresh
        if (accessToken && tokenManager.needsRefresh()) {
          try {
            await this.refreshAccessToken();
            const newToken = tokenManager.getAccessToken();
            if (newToken) {
              config.headers.Authorization = `Bearer ${newToken}`;
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            // Continue with existing token
            if (accessToken) {
              config.headers.Authorization = `Bearer ${accessToken}`;
            }
          }
        } else if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
          if (this.isAuthEndpoint(originalRequest.url || '')) {
            return Promise.reject(this.handleError(error));
          }

          originalRequest._retry = true;

          if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
              await this.refreshAccessToken();
              const newToken = tokenManager.getAccessToken();

              if (newToken) {
                this.onRefreshSuccess(newToken);
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                return this.axiosInstance(originalRequest);
              }
            } catch (refreshError) {
              this.onRefreshFailure();
              return Promise.reject(this.handleError(error));
            } finally {
              this.isRefreshing = false;
            }
          }

          // Wait for token refresh
          return new Promise((resolve) => {
            this.subscribeToRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(this.axiosInstance(originalRequest));
            });
          });
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Check if URL is an auth endpoint
   */
  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/');
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new ApiException(
        API_ERROR_CODES.UNAUTHORIZED,
        'No refresh token available',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        null,
        {
          params: { refreshToken },
        }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      tokenManager.setTokens(accessToken, newRefreshToken);
    } catch (error) {
      tokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Subscribe to token refresh
   */
  private subscribeToRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notify subscribers on refresh success
   */
  private onRefreshSuccess(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Handle refresh failure
   */
  private onRefreshFailure(): void {
    this.refreshSubscribers = [];
    tokenManager.clearTokens();
    // Redirect to login if in browser
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): ApiException {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      return new ApiException(
        data.code || API_ERROR_CODES.SERVER_ERROR,
        data.message || error.message,
        error.response.status,
        data.details || data.errors
      );
    } else if (error.request) {
      // Request made but no response
      return new ApiException(
        API_ERROR_CODES.NETWORK_ERROR,
        'Network error - please check your connection',
        0
      );
    } else {
      // Error in request setup
      return new ApiException(
        API_ERROR_CODES.UNKNOWN_ERROR,
        error.message || 'An unknown error occurred',
        0
      );
    }
  }

  /**
   * GET request
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload file with multipart/form-data
   */
  public async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': CONTENT_TYPES.FORM_DATA,
      },
    });
    return response.data;
  }

  /**
   * Get axios instance for custom requests
   */
  public getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };

