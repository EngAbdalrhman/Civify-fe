/**
 * API Configuration
 * Centralized configuration for backend API endpoints and settings
 */

// Base URL for the backend API
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8077/apis";

// API Version
export const API_VERSION = "";

// Full base URL with version
export const API_URL = API_VERSION ? `${API_BASE_URL}/${API_VERSION}` : API_BASE_URL;

/**
 * API Endpoints
 * Organized by domain/feature
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_VERIFICATION: "/auth/resend-verification",
    VERIFY_OTP: "/auth/verify-otp",
    ENABLE_2FA: "/auth/enable-2fa",
  },

  // User Management
  USERS: {
    ME: "v1/users/me",
    ALL: "v1/users",
    BY_ID: (id: string | number) => `v1/users/${id}`,
  },

  // Subscription Management
  SUBSCRIPTIONS: {
    PLANS: "v1/subscriptions/plans",
    PLAN_BY_ID: (id: string | number) => `v1/subscriptions/plans/${id}`,
    MY_SUBSCRIPTION: "v1/subscriptions/my-subscription",
    MY_SUBSCRIPTIONS: "v1/subscriptions/my-subscriptions",
    CANCEL: (id: string | number) => `v1/subscriptions/cancel/${id}`,
    RENEW: (id: string | number) => `v1/subscriptions/renew/${id}`,
  },

  // Payment Processing
  PAYMENTS: {
    INITIATE: "v1/payments/initiate",
    WEBHOOK: "v1/payments/webhook",
    VERIFY: (transactionId: string) => `v1/payments/verify/${transactionId}`,
  },

  // CV Management
  CVS: {
    UPLOAD: "v1/cvs/upload",
    TAILOR: (id: string | number) => `v1/cvs/${id}/tailor`,
    BY_ID: (id: string | number) => `v1/cvs/${id}`,
    ALL: "v1/cvs",
  },

  // API Usage Logs
  LOGS: {
    FILTER: "v1/logs/filter",
    MY_LOGS: "v1/logs/my-logs",
    BY_USER: (userId: string | number) => `v1/logs/user/${userId}`,
    BY_ENDPOINT: "v1/logs/endpoint",
  },

  // Admin - Plan Management
  ADMIN: {
    PLANS: {
      ALL: "v1/admin/plans",
      BY_ID: (id: string | number) => `v1/admin/plans/${id}`,
      CREATE: "v1/admin/plans",
      UPDATE: (id: string | number) => `v1/admin/plans/${id}`,
      ACTIVATE: (id: string | number) => `v1/admin/plans/${id}/activate`,
      DEACTIVATE: (id: string | number) => `v1/admin/plans/${id}/deactivate`,
      DELETE: (id: string | number) => `v1/admin/plans/${id}`,
    },
  },
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Token refresh threshold in milliseconds
 * Refresh token when it's about to expire within this time
 */
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

/**
 * Storage keys for tokens
 */
// TODO be renamed
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "hicv_access_token",
  REFRESH_TOKEN: "hicv_refresh_token",
  TOKEN_EXPIRY: "hicv_token_expiry",
  USER_DATA: "hicv_user_data",
} as const;

/**
 * API Error Codes
 */
export const API_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

/**
 * Content Types
 */
export const CONTENT_TYPES = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  URL_ENCODED: "application/x-www-form-urlencoded",
} as const;
