import { toast } from "sonner";
import {
  getAccessToken,
  setAccessToken,
  clearAuthTokens,
} from "@/utils/cookies";

// Constants
const MAX_REFRESH_RETRIES = 3;
const DEFAULT_TIMEOUT = 30000;
const REFRESH_TIMEOUT_MS = 30000; // Safety timeout to reset isRefreshing if stuck

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;
// Counter for refresh retry attempts
let refreshRetryCount = 0;
// Queue of requests waiting for token refresh
let refreshSubscribers: {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}[] = [];

// Types
interface ApiRequestConfig extends Omit<RequestInit, "body"> {
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined>;
  _retry?: boolean;
  skipErrorToast?: boolean;
  body?: BodyInit | null | object;
}

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

interface ApiError {
  status?: number;
  message: string;
  errorCode?: string;
  data?: unknown;
}

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
    // In development, use the proxy to solve cross-origin cookie issues
    const baseUrl =
      typeof window !== "undefined" && process.env.NODE_ENV === "development"
        ? "/api"
        : process.env.NEXT_PUBLIC_API_URL;
    const refreshUrl = `${baseUrl}/auth/refresh`;
    console.log("[Auth] DEBUG: Refresh URL:", refreshUrl);
    console.log(
      "[Auth] DEBUG: Current origin:",
      typeof window !== "undefined" ? window.location.origin : "SSR",
    );
    console.log(
      "[Auth] DEBUG: Document cookies (non-httpOnly):",
      typeof document !== "undefined" ? document.cookie : "SSR",
    );

    const response = await fetch(refreshUrl, {
      method: "POST",
      credentials: "include", // This sends the httpOnly refresh token cookie
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Refresh failed with status ${response.status}`);
    }

    const data = await response.json();
    const { accessToken } = data;

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

// Fetch with timeout support
const fetchWithTimeout = async (
  url: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> => {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Check if we should use the local proxy (development mode)
const shouldUseProxy = (): boolean => {
  if (typeof window === "undefined") return false; // SSR should call backend directly

  // Allow explicit override via env var
  if (process.env.NEXT_PUBLIC_USE_PROXY === "true") return true;
  if (process.env.NEXT_PUBLIC_USE_PROXY === "false") return false;

  // Use proxy in development to solve cross-origin cookie issues
  return process.env.NODE_ENV === "development";
};

// Get the API base URL - uses proxy in development
const getApiBaseUrl = (): string => {
  if (shouldUseProxy()) {
    // In development, route through Next.js API proxy
    return "/api";
  }
  return process.env.NEXT_PUBLIC_API_URL || "";
};

// Build full URL from path with query params
const buildUrl = (
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string => {
  const baseURL = getApiBaseUrl();
  let fullUrl: string;

  // If path is already a full URL, use as is (but not in development with proxy)
  if (
    !shouldUseProxy() &&
    (path.startsWith("http://") || path.startsWith("https://"))
  ) {
    fullUrl = path;
  } else {
    // Ensure proper path joining
    const cleanBase = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    fullUrl = `${cleanBase}${cleanPath}`;
  }

  // Add query params if present
  if (params && Object.keys(params).length > 0) {
    const url = new URL(fullUrl, window?.location?.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.toString();
  }

  return fullUrl;
};

// Add auth headers to request
const addAuthHeaders = (headers: HeadersInit = {}): Headers => {
  const newHeaders = new Headers(headers);

  if (!newHeaders.has("Content-Type")) {
    newHeaders.set("Content-Type", "application/json");
  }

  if (typeof window !== "undefined") {
    const token = getAccessToken();
    if (token) {
      newHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  return newHeaders;
};

// Process response and extract tokens
const processResponse = async <T>(
  response: Response,
): Promise<ApiResponse<T>> => {
  // Try to parse JSON, fallback to empty object for no-content responses
  let data: T;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = {} as T;
  }

  // Extract access token from response body (login responses)
  // and store it using centralized utility
  if (
    data &&
    typeof data === "object" &&
    "accessToken" in data &&
    typeof window !== "undefined"
  ) {
    setAccessToken((data as { accessToken: string }).accessToken);
  }

  // Also check Authorization header (legacy support)
  const authHeader = response.headers.get("authorization");
  if (authHeader && typeof window !== "undefined") {
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;
    setAccessToken(token);
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  };
};

// Handle 401 errors with token refresh
const handle401Error = async <T>(
  url: string,
  options: ApiRequestConfig,
  errorData: { message?: string; errorCode?: string },
): Promise<ApiResponse<T>> => {
  const errorCode = errorData?.errorCode;

  // Skip refresh for email verification errors - let component handle it
  if (errorCode === "AUTH_001") {
    throw {
      status: 401,
      message: errorData?.message || "Email not verified",
      errorCode,
      data: errorData,
    } as ApiError;
  }

  // Skip refresh for login/refresh endpoints themselves
  if (url.includes("/login")) {
    // For login failures, just reject the error without redirecting
    // The login page will handle displaying the error message
    console.log("[Auth] 401 on login endpoint, letting component handle error");
    throw {
      status: 401,
      message: errorData?.message || "Invalid credentials",
      errorCode: errorData?.errorCode,
      data: errorData,
    } as ApiError;
  }

  if (url.includes("/auth/refresh")) {
    console.log(
      "[Auth] 401 on refresh endpoint - refresh token is invalid/expired",
    );
    clearAuthAndRedirect();
    throw new Error("Refresh token expired");
  }

  // If already refreshing, queue this request
  if (isRefreshing) {
    console.log("[Auth] Refresh in progress, queuing request:", url);
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh(
        async (token: string) => {
          try {
            const headers = new Headers(options.headers);
            headers.set("Authorization", `Bearer ${token}`);
            const result = await apiClient<T>(url, { ...options, headers });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        (refreshError: Error) => {
          reject(refreshError);
        },
      );
    });
  }

  isRefreshing = true;

  // Safety timeout: reset isRefreshing flag if refresh hangs
  if (refreshTimeoutId) clearTimeout(refreshTimeoutId);
  refreshTimeoutId = setTimeout(() => {
    if (isRefreshing) {
      console.log(
        "[Auth] Refresh safety timeout reached, resetting isRefreshing flag",
      );
      isRefreshing = false;
      refreshRetryCount = 0;
      onTokenRefreshFailed(new Error("Refresh timeout"));
    }
  }, REFRESH_TIMEOUT_MS);

  try {
    // Reset retry count before starting refresh attempts
    refreshRetryCount = 0;

    const accessToken = await attemptTokenRefresh();

    isRefreshing = false;
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
      refreshTimeoutId = null;
    }
    onTokenRefreshed(accessToken);

    // Retry original request with new token
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return await apiClient<T>(url, { ...options, headers, _retry: true });
  } catch (refreshError) {
    console.log("[Auth] Token refresh failed after all retries");
    isRefreshing = false;
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
      refreshTimeoutId = null;
    }
    onTokenRefreshFailed(
      refreshError instanceof Error
        ? refreshError
        : new Error("Refresh failed"),
    );
    clearAuthAndRedirect();
    throw refreshError;
  }
};

// Check if body is a BodyInit type (not a plain object that needs stringification)
const isBodyInit = (body: unknown): body is BodyInit => {
  return (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof ReadableStream ||
    typeof body === "string"
  );
};

// Main API client function - returns axios-compatible response with { data, status, headers }
async function apiClient<T = unknown>(
  url: string,
  options: ApiRequestConfig = {},
): Promise<ApiResponse<T>> {
  const { params, _retry, skipErrorToast, body, ...restOptions } = options;
  const fullUrl = buildUrl(url, params);
  const headers = addAuthHeaders(restOptions.headers);

  // Handle body - if it's FormData/URLSearchParams/etc, pass through; otherwise stringify
  let processedBody: BodyInit | null | undefined;
  if (body === null || body === undefined) {
    processedBody = body;
  } else if (isBodyInit(body)) {
    processedBody = body;
    // Remove Content-Type for FormData to let browser set it with boundary
    if (body instanceof FormData) {
      headers.delete("Content-Type");
    }
  } else {
    processedBody = JSON.stringify(body);
  }

  const fetchOptions: RequestInit & { timeout?: number } = {
    ...restOptions,
    headers,
    body: processedBody,
    credentials: "include", // This ensures cookies are sent with every request
  };

  try {
    const response = await fetchWithTimeout(fullUrl, fetchOptions);

    // Handle 401 Unauthorized
    if (response.status === 401 && !_retry) {
      const errorData = await response.json().catch(() => ({}));
      return await handle401Error<T>(
        url,
        { ...options, _retry: true },
        errorData,
      );
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.message || `Request failed with status ${response.status}`;

      // Only show toast for non-auth errors if not skipped
      if (response.status !== 401 && !skipErrorToast) {
        toast.error(errorMessage);
      }

      throw {
        status: response.status,
        message: errorMessage,
        errorCode: errorData?.errorCode,
        data: errorData,
      } as ApiError;
    }

    // Process successful response
    return await processResponse<T>(response);
  } catch (error) {
    // Handle abort errors (timeout)
    if (error instanceof DOMException && error.name === "AbortError") {
      const timeoutError: ApiError = {
        status: 408,
        message: "Request timeout",
      };
      toast.error("Request timeout. Please try again.");
      throw timeoutError;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      const networkError: ApiError = {
        message: "Network error. Please check your connection.",
      };
      toast.error("Network error. Please check your connection.");
      throw networkError;
    }

    // Re-throw ApiError as is
    if (
      (error as ApiError).status !== undefined ||
      (error as ApiError).message !== undefined
    ) {
      throw error;
    }

    // Handle other errors
    const message =
      error instanceof Error ? error.message : "An error occurred";
    
    if (!skipErrorToast) {
      toast.error(message);
    }
    throw { message } as ApiError;
  }
}

// HTTP method helpers for cleaner API - matches axios interface
apiClient.get = <T = unknown>(
  url: string,
  options?: Omit<ApiRequestConfig, "method" | "body">,
): Promise<ApiResponse<T>> => apiClient<T>(url, { ...options, method: "GET" });

apiClient.post = <T = unknown>(
  url: string,
  body?: object | null,
  options?: Omit<ApiRequestConfig, "method" | "body">,
): Promise<ApiResponse<T>> =>
  apiClient<T>(url, {
    ...options,
    method: "POST",
    body: body ?? undefined,
  });

apiClient.put = <T = unknown>(
  url: string,
  body?: object | null,
  options?: Omit<ApiRequestConfig, "method" | "body">,
): Promise<ApiResponse<T>> =>
  apiClient<T>(url, {
    ...options,
    method: "PUT",
    body: body ?? undefined,
  });

apiClient.patch = <T = unknown>(
  url: string,
  body?: object | null,
  options?: Omit<ApiRequestConfig, "method" | "body">,
): Promise<ApiResponse<T>> =>
  apiClient<T>(url, {
    ...options,
    method: "PATCH",
    body: body ?? undefined,
  });

apiClient.delete = <T = unknown>(
  url: string,
  options?: Omit<ApiRequestConfig, "method"> & { data?: object },
): Promise<ApiResponse<T>> =>
  apiClient<T>(url, { ...options, method: "DELETE", body: options?.data });

// For FormData uploads (file uploads) - kept for explicit FormData handling
apiClient.postForm = <T = unknown>(
  url: string,
  formData: FormData,
  options?: Omit<ApiRequestConfig, "method" | "body">,
): Promise<ApiResponse<T>> => {
  return apiClient<T>(url, {
    ...options,
    method: "POST",
    body: formData,
  });
};

export default apiClient;
