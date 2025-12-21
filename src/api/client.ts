import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage or cookies
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

// Response interceptor for handling errors and extracting tokens
apiClient.interceptors.response.use(
  (response) => {
    // Extract token from Authorization header if present (for login responses)
    const authHeader = response.headers["authorization"];
    if (authHeader && typeof window !== "undefined") {
      // Remove 'Bearer ' prefix if present
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader;
      localStorage.setItem("auth_token", token);
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.errorCode;
      
      // Skip redirect if error is about email verification (let component handle it)
      if (errorCode === 'AUTH_001') {
        // Do nothing, let component handle email verification flow
      } else {
        // Clear auth token and redirect for other 401 errors
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
        }
      }
    }

    // Handle other errors
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An error occurred. Please try again.";

    // Show error toast
    toast.error(errorMessage);

    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      errorCode: error.response?.data?.errorCode,
      data: error.response?.data,
    });
  }
);

export default apiClient;
