/**
 * Centralized Error Handler
 * Provides utilities for handling errors with localized messages and toast notifications
 */

import { toast } from "@/hooks/use-toast";
import { ApiException } from "./api/types";

/**
 * Translation function type
 * Can be from useTranslate or getTranslate
 */
type TranslateFunction = (key: string, params?: Record<string, any>) => string;

/**
 * Error message mapping for common error codes
 * These keys should match the keys in the i18n message files
 */
const ERROR_MESSAGE_KEYS: Record<string, string> = {
  // Network errors
  NETWORK_ERROR: "error.network",
  TIMEOUT_ERROR: "error.timeout",

  // Authentication errors
  UNAUTHORIZED: "common.unauthorized",
  FORBIDDEN: "common.forbidden",
  TOKEN_EXPIRED: "auth.token.expired",
  TOKEN_INVALID: "auth.token.invalid",

  // Validation errors
  VALIDATION_ERROR: "common.badrequest",
  BAD_REQUEST: "common.badrequest",

  // Resource errors
  NOT_FOUND: "common.notfound",
  ALREADY_EXISTS: "common.error",

  // Server errors
  SERVER_ERROR: "common.internalerror",
  SERVICE_UNAVAILABLE: "error.serviceUnavailable",
  DATABASE_ERROR: "error.database",

  // Subscription errors
  SUBSCRIPTION_LIMIT_REACHED: "subscription.limitReached",
  CV_LIMIT_REACHED: "subscription.cvLimitReached",
  API_LIMIT_REACHED: "subscription.apiLimitReached",

  // Payment errors
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_GATEWAY_ERROR: "payment.gatewayError",

  // File errors
  FILE_UPLOAD_ERROR: "error.fileUpload",
  FILE_DOWNLOAD_ERROR: "error.fileDownload",
  INVALID_FILE_FORMAT: "cv.invalidFormat",
  FILE_SIZE_EXCEEDED: "cv.sizeExceeded",

  // Unknown error
  UNKNOWN_ERROR: "error.unknown",
};

/**
 * Get localized error message from error code
 * Falls back to the error message if no translation key is found
 * @param error - The error object
 * @param translate - Translation function from useTranslate or getTranslate
 */
export function getErrorMessage(
  error: unknown,
  translate?: TranslateFunction
): string {
  // If error is an ApiException
  if (error instanceof ApiException) {
    const messageKey = ERROR_MESSAGE_KEYS[error.code];

    // If translation function is provided and we have a key, use it
    if (translate && messageKey) {
      return translate(messageKey);
    }

    // Otherwise return the error message
    return (
      error.message ||
      (translate ? translate("error.unknown") : "An error occurred")
    );
  }

  // If error is a standard Error
  if (error instanceof Error) {
    return (
      error.message ||
      (translate ? translate("error.unknown") : "An error occurred")
    );
  }

  // If error is a string
  if (typeof error === "string") {
    return error;
  }

  // Unknown error type
  return translate ? translate("error.unknown") : "An unknown error occurred";
}

/**
 * Show error toast notification
 * Automatically extracts and localizes the error message
 * @param error - The error object
 * @param translate - Translation function from useTranslate or getTranslate
 * @param options - Toast options (title, duration)
 */
export function showErrorToast(
  error: unknown,
  translate?: TranslateFunction,
  options?: {
    title?: string;
    duration?: number;
  }
) {
  const message = getErrorMessage(error, translate);

  toast({
    variant: "destructive",
    title: options?.title || (translate ? translate("common.error") : "Error"),
    description: message,
    duration: options?.duration || 5000,
  });
}

/**
 * Show success toast notification
 */
export function showSuccessToast(
  message: string,
  options?: {
    title?: string;
    duration?: number;
  }
) {
  toast({
    title: options?.title || "Success",
    description: message,
    duration: options?.duration || 3000,
  });
}

/**
 * Show info toast notification
 */
export function showInfoToast(
  message: string,
  options?: {
    title?: string;
    duration?: number;
  }
) {
  toast({
    title: options?.title || "Info",
    description: message,
    duration: options?.duration || 3000,
  });
}

/**
 * Show warning toast notification
 */
export function showWarningToast(
  message: string,
  options?: {
    title?: string;
    duration?: number;
  }
) {
  toast({
    variant: "destructive",
    title: options?.title || "Warning",
    description: message,
    duration: options?.duration || 4000,
  });
}

/**
 * Handle async operation with error handling
 * Automatically shows error toast on failure
 * @param operation - The async operation to execute
 * @param options - Options for success/error handling
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  options?: {
    onSuccess?: (result: T) => void;
    onError?: (error: unknown) => void;
    successMessage?: string;
    errorTitle?: string;
    translate?: TranslateFunction;
  }
): Promise<T | null> {
  try {
    const result = await operation();

    if (options?.onSuccess) {
      options.onSuccess(result);
    }

    if (options?.successMessage) {
      showSuccessToast(options.successMessage, {
        title: options.translate
          ? options.translate("common.success")
          : "Success",
      });
    }

    return result;
  } catch (error) {
    console.error("Operation failed:", error);

    if (options?.onError) {
      options.onError(error);
    } else {
      showErrorToast(error, options?.translate, {
        title: options?.errorTitle,
      });
    }

    return null;
  }
}

/**
 * Validate form field and return error message
 * @param value - The field value to validate
 * @param rules - Validation rules
 * @param fieldName - The field name for error messages
 * @param translate - Translation function from useTranslate or getTranslate
 */
export function validateField(
  value: any,
  rules: {
    required?: boolean;
    min?: number;
    max?: number;
    email?: boolean;
    pattern?: RegExp;
  },
  fieldName: string,
  translate?: TranslateFunction
): string | null {
  if (rules.required && (!value || value.toString().trim() === "")) {
    return translate
      ? translate("validation.required", { field: fieldName })
      : `${fieldName} is required`;
  }

  if (rules.min && value.toString().length < rules.min) {
    return translate
      ? translate("validation.min", { field: fieldName, min: rules.min })
      : `${fieldName} must be at least ${rules.min} characters`;
  }

  if (rules.max && value.toString().length > rules.max) {
    return translate
      ? translate("validation.max", { field: fieldName, max: rules.max })
      : `${fieldName} must be at most ${rules.max} characters`;
  }

  if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return translate ? translate("validation.email") : "Invalid email format";
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return translate
      ? translate("validation.invalid", { field: fieldName })
      : `${fieldName} is invalid`;
  }

  return null;
}

/**
 * Log error to console with detailed information
 * In production, this could send errors to a monitoring service
 */
export function logError(error: unknown, context?: Record<string, any>) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    context,
    userAgent:
      typeof window !== "undefined" ? window.navigator.userAgent : "SSR",
    url: typeof window !== "undefined" ? window.location.href : "SSR",
  };

  console.error("Error logged:", errorInfo);

  // TODO: In production, send to monitoring service (e.g., Sentry, LogRocket)
  // Example: Sentry.captureException(error, { extra: context });
}
