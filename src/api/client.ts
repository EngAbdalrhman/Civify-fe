import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
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

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear auth token
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        // Redirect to login
        window.location.href = "/login";
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
      data: error.response?.data,
    });
  }
);

export default apiClient;
