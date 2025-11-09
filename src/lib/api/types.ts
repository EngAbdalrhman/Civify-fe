/**
 * API Type Definitions
 * TypeScript interfaces for API requests and responses
 */

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  requires2FA: boolean;
  message?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyOtpRequest {
  username: string;
  code: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: number;
  username: string;
  email: string;
  role: "ROLE_USER" | "ROLE_LICENSED_USER" | "ROLE_ADMIN";
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Subscription Types
// ============================================================================

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  details: string;
  cvLimit: number | null; // null = unlimited
  apiLimit: number | null; // null = unlimited
  watermark: boolean;
  dashboard: boolean;
  monthlyPrice: string; // BigDecimal as string
  annualPrice: string; // BigDecimal as string
  active: boolean;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: "PENDING" | "ACTIVE" | "CANCELLED" | "EXPIRED";
  paymentTransactionId?: string;
  autoRenew: boolean;
  currentCvCount: number;
  currentApiCount: number;
}

export interface SubscriptionResponse {
  id: number;
  userId: number;
  planId: number;
  planName: string;
  planDescription: string;
  cvLimit: number | null;
  apiLimit: number | null;
  currentCvCount: number;
  currentApiCount: number;
  startDate: string;
  endDate: string;
  status: "PENDING" | "ACTIVE" | "CANCELLED" | "EXPIRED";
  paymentTransactionId?: string;
}

export interface SubscriptionRequest {
  planId: number;
  promoCode?: string;
  isAnnual: boolean;
}

export interface PriceCalculationResponse {
  planId: number;
  planName: string;
  basePrice: string;
  discount: string;
  totalPrice: string;
  promoCode?: string;
  isAnnual: boolean;
}

// ============================================================================
// Admin - Plan Management Types
// ============================================================================

export interface PlanWithStats {
  plan: SubscriptionPlan;
  activeSubscriptionCount: number;
}

export interface CreatePlanRequest {
  name: string;
  description: string;
  details: string;
  cvLimit: number | null;
  apiLimit: number | null;
  watermark: boolean;
  dashboard: boolean;
  monthlyPrice: string;
  annualPrice: string;
  active?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  details?: string;
  cvLimit?: number | null;
  apiLimit?: number | null;
  watermark?: boolean;
  dashboard?: boolean;
  monthlyPrice?: string;
  annualPrice?: string;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface PaymentRequest {
  planId: number;
  promoCode?: string;
  isAnnual: boolean;
  gateway?: string; // defaults to "paymob"
}

export interface PaymentInitiationResponse {
  paymentKey: string;
  orderId: string;
  subscriptionId: number;
  amount: string;
  currency: string;
  paymentUrl: string;
  message: string;
}

export interface PaymentTransaction {
  id: string;
  userId: number;
  orderId: string;
  paymentKey: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  amount: string;
  currency: string;
  completedAt?: string;
  gateway: string;
  subscriptionId?: number;
}

// ============================================================================
// CV Types
// ============================================================================

export interface CvUploadRequest {
  file: File;
}

export interface CvTailorRequest {
  jobDescription: string;
}

// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>; // Validation errors
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PageRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================================================
// Filter Types
// ============================================================================

export type FilterOperation =
  | "EQUAL"
  | "NOT_EQUAL"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "GREATER_THAN_OR_EQUAL"
  | "LESS_THAN_OR_EQUAL"
  | "LIKE"
  | "MATCH"
  | "MATCH_EXACT"
  | "IN"
  | "NOT_IN"
  | "IS_NULL"
  | "IS_NOT_NULL"
  | "BETWEEN";

export interface Filter {
  fieldName: string;
  operation: FilterOperation;
  value?: any;
  values?: any[]; // For IN, NOT_IN, BETWEEN operations
}

export interface FilterGroup {
  filters?: Filter[];
  groups?: FilterGroup[];
  operation: "AND" | "OR";
}

export interface FilterRequest extends PageRequest {
  filterGroup?: FilterGroup;
}

export interface FilterResponse<T> extends PageResponse<T> {}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

export class ApiException extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = "ApiException";
  }
}
