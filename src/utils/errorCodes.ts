/**
 * Centralized error codes matching backend ErrorCode.java enum
 * Used for reliable error detection and translation
 */
export const ErrorCodes = {
  // Authentication & Authorization
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_001',
  AUTH_INVALID_CREDENTIALS: 'AUTH_002',
  AUTH_TOKEN_EXPIRED: 'AUTH_003',
  AUTH_TOKEN_INVALID: 'AUTH_004',
  AUTH_UNAUTHORIZED: 'AUTH_005',
  AUTH_ACCOUNT_DISABLED: 'AUTH_006',
  AUTH_2FA_REQUIRED: 'AUTH_007',
  AUTH_2FA_INVALID: 'AUTH_008',
  
  // Validation
  VALIDATION_FAILED: 'VAL_001',
  VALIDATION_EMAIL_EXISTS: 'VAL_002',
  VALIDATION_USERNAME_EXISTS: 'VAL_003',
  VALIDATION_INVALID_INPUT: 'VAL_004',
  
  // Resource Errors
  RESOURCE_NOT_FOUND: 'RES_001',
  RESOURCE_ALREADY_EXISTS: 'RES_002',
  RESOURCE_ACCESS_DENIED: 'RES_003',
  
  // Payment
  PAYMENT_FAILED: 'PAY_001',
  PAYMENT_INVALID_METHOD: 'PAY_002',
  SUBSCRIPTION_EXPIRED: 'PAY_003',
  
  // General Errors
  INTERNAL_ERROR: 'GEN_001',
  BAD_REQUEST: 'GEN_002',
  SERVICE_UNAVAILABLE: 'GEN_003',
} as const;

export type ErrorCodeType = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Check if error code indicates email verification is required
 */
export const isEmailVerificationError = (errorCode?: string): boolean => 
  errorCode === ErrorCodes.AUTH_EMAIL_NOT_VERIFIED;

/**
 * Check if error code indicates invalid credentials
 */
export const isInvalidCredentialsError = (errorCode?: string): boolean =>
  errorCode === ErrorCodes.AUTH_INVALID_CREDENTIALS;

/**
 * Check if error code indicates 2FA is required
 */
export const is2FARequiredError = (errorCode?: string): boolean =>
  errorCode === ErrorCodes.AUTH_2FA_REQUIRED;

/**
 * Check if error is related to authentication
 */
export const isAuthError = (errorCode?: string): boolean =>
  errorCode?.startsWith('AUTH_') ?? false;

/**
 * Check if error is related to validation
 */
export const isValidationError = (errorCode?: string): boolean =>
  errorCode?.startsWith('VAL_') ?? false;

/**
 * Get error code from API error response
 */
export const getErrorCode = (error: any): string | undefined => {
  return error?.response?.data?.errorCode || 
         error?.data?.errorCode || 
         error?.errorCode;
};

/**
 * Get error message from API error response
 */
export const getErrorMessage = (error: any, fallback = 'An error occurred'): string => {
  return error?.response?.data?.message || 
         error?.data?.message || 
         error?.message || 
         fallback;
};
