import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from "axios";
import { toast } from "sonner";
import {
  getAccessToken,
  setAccessToken,
  clearAuthTokens,
} from "@/utils/cookies";

// Constants
const MAX_REFRESH_RETRIES = 3;

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Counter for refresh retry attempts
let refreshRetryCount = 0;
// Queue of requests waiting for token refresh
let refreshSubscribers: {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}[] = [];

// Subscribe a request to wait for token refresh
const subscribeTokenRefresh = (
  resolve: (token: string) => void,
  reject: (error: Error) => void,
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
    console.log("[Auth] Clearing tokens");

    // Clear all auth tokens using centralized utility
    clearAuthTokens();

    // Reset refresh retry count
    refreshRetryCount = 0;

    // Check if we are on a public page where we shouldn't redirect
    const path = window.location.pathname;

    // Whitelist of paths that should NOT redirect to login on 401
    // Includes landing page (/), legacy upload (/app/upload), and plans (/plans)
    // Also include locale prefixes
    const isPublicPage =
      path === "/" ||
      path === "/en" ||
      path === "/ar" ||
      path.includes("/plans") ||
      path.includes("/app/upload");

    if (!isPublicPage) {
      console.log("[Auth] Redirecting to login from protected route");
      window.location.href = "/login";
    } else {
      console.log("[Auth] Staying on public page after auth clear");
    }
  }
};

// Attempt to refresh the token with retry logic
const attemptTokenRefresh = async (): Promise<string> => {
  refreshRetryCount++;
  console.log(
    `[Auth] Attempting token refresh (attempt ${refreshRetryCount}/${MAX_REFRESH_RETRIES})...`,
  );

  try {
    // Call refresh endpoint - the httpOnly refresh token cookie will be sent automatically
    // because we have withCredentials: true
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      null,
      {
        withCredentials: true, // This sends the httpOnly refresh token cookie
      },
    );

    const { accessToken } = response.data;

    if (!accessToken) {
      throw new Error("No access token in refresh response");
    }

    console.log("[Auth] Token refresh successful");

    // Set the new access token using centralized utility
    setAccessToken(accessToken);

    // Reset retry count on success
    refreshRetryCount = 0;

    return accessToken;
  } catch (error) {
    console.log(
      `[Auth] Token refresh attempt ${refreshRetryCount} failed:`,
      error,
    );

    // If we haven't exceeded max retries, try again
    if (refreshRetryCount < MAX_REFRESH_RETRIES) {
      // Add a small delay before retrying (exponential backoff)
      const delay = Math.pow(2, refreshRetryCount - 1) * 500; // 500ms, 1s, 2s
      await new Promise((resolve) => setTimeout(resolve, delay));
      return attemptTokenRefresh();
    }

    // Max retries exceeded
    console.log(
      `[Auth] Token refresh failed after ${MAX_REFRESH_RETRIES} attempts`,
    );
    throw error;
  }
};

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  withCredentials: true, // This ensures cookies are sent with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token from cookie
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      // Get access token from cookie using centralized utility
      const token = getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Extract access token from response body (login responses)
    // and store it using centralized utility
    const data = response.data;
    if (data?.accessToken && typeof window !== "undefined") {
      setAccessToken(data.accessToken);
    }

    // Also check Authorization header (legacy support)
    const authHeader = response.headers["authorization"];
    if (authHeader && typeof window !== "undefined") {
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader;
      setAccessToken(token);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const errorCode = (error.response?.data as { errorCode?: string })
        ?.errorCode;

      // Skip refresh for email verification errors - let component handle it
      if (errorCode === "AUTH_001") {
        return Promise.reject({
          status: error.response?.status,
          message:
            (error.response?.data as { message?: string })?.message ||
            "Email not verified",
          errorCode,
          data: error.response?.data,
        });
      }

      // Skip refresh for login/refresh endpoints themselves
      const url = originalRequest.url || "";
      if (url.includes("/login") || url.includes("/auth/refresh")) {
        console.log(
          "[Auth] 401 on login/refresh endpoint, redirecting to login",
        );
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      // Check if access token exists - if not, no point in retrying refresh
      // Just redirect to login immediately
      const currentAccessToken = getAccessToken();
      if (!currentAccessToken) {
        console.log(
          "[Auth] No access token found, skipping refresh and redirecting to login",
        );
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
            },
          );
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Reset retry count before starting refresh attempts
        refreshRetryCount = 0;

        const accessToken = await attemptTokenRefresh();

        isRefreshing = false;
        onTokenRefreshed(accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log("[Auth] Token refresh failed after all retries");
        isRefreshing = false;
        onTokenRefreshFailed(
          refreshError instanceof Error
            ? refreshError
            : new Error("Refresh failed"),
        );
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
  },
);

export default apiClient;
