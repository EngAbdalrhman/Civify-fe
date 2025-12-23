import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from "axios";
import { toast } from "sonner";

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue of requests waiting for token refresh
let refreshSubscribers: {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}[] = [];

// Subscribe a request to wait for token refresh
const subscribeTokenRefresh = (
  resolve: (token: string) => void,
  reject: (error: Error) => void
) => {
  refreshSubscribers.push({ resolve, reject });
};

// Notify all subscribers with new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
};

// Notify all subscribers of refresh failure
const onTokenRefreshFailed = (error: Error) => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

// Clear auth state and redirect to login
const clearAuthAndRedirect = () => {
  if (typeof window !== "undefined") {
    console.log("[Auth] Clearing tokens and redirecting to login");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  }
};

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Extract tokens from response body (login/refresh responses)
    const data = response.data;
    if (data?.accessToken && typeof window !== "undefined") {
      localStorage.setItem("auth_token", data.accessToken);
    }
    if (data?.refreshToken && typeof window !== "undefined") {
      localStorage.setItem("refresh_token", data.refreshToken);
    }
    
    // Also check Authorization header (legacy support)
    const authHeader = response.headers["authorization"];
    if (authHeader && typeof window !== "undefined") {
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader;
      localStorage.setItem("auth_token", token);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const errorCode = (error.response?.data as { errorCode?: string })?.errorCode;
      
      // Skip refresh for email verification errors - let component handle it
      if (errorCode === "AUTH_001") {
        return Promise.reject({
          status: error.response?.status,
          message: (error.response?.data as { message?: string })?.message || "Email not verified",
          errorCode,
          data: error.response?.data,
        });
      }

      // Skip refresh for login/refresh endpoints themselves
      const url = originalRequest.url || "";
      if (url.includes("/login") || url.includes("/auth/refresh")) {
        console.log("[Auth] 401 on login/refresh endpoint, redirecting to login");
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        console.log("[Auth] Refresh in progress, queuing request:", url);
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(
            (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            (refreshError: Error) => {
              reject(refreshError);
            }
          );
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = typeof window !== "undefined" 
          ? localStorage.getItem("refresh_token") 
          : null;

        if (!refreshToken) {
          console.log("[Auth] No refresh token available");
          throw new Error("No refresh token available");
        }

        console.log("[Auth] Attempting token refresh...");
        
        // Call refresh endpoint
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          null,
          { params: { refreshToken } }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        if (!accessToken) {
          throw new Error("No access token in refresh response");
        }

        console.log("[Auth] Token refresh successful");

        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", accessToken);
          if (newRefreshToken) {
            localStorage.setItem("refresh_token", newRefreshToken);
          }
        }

        isRefreshing = false;
        onTokenRefreshed(accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log("[Auth] Token refresh failed:", refreshError);
        isRefreshing = false;
        onTokenRefreshFailed(refreshError instanceof Error ? refreshError : new Error("Refresh failed"));
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      "An error occurred. Please try again.";

    // Only show toast for non-auth errors
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      errorCode: (error.response?.data as { errorCode?: string })?.errorCode,
      data: error.response?.data,
    });
  }
);

export default apiClient;
