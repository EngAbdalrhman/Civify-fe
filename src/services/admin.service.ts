/**
 * Admin API Service
 * Handles all admin operations for the HICv dashboard
 */

import apiClient from "@/api/client";
import {
  InputDataModel,
  FilterOperation,
  FilterItem,
} from "@/components/generic-list/types";

// Re-export for distinct usage if needed, or just use directly
export { FilterOperation };
export type { InputDataModel };
export type { FilterItem as FilterCriteria }; // Alias for backward compatibility

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ============================================
// Admin Stats Types
// ============================================

export interface AdminStats {
  totalUsers: number;
  subscribedUsers: number;
  totalCVs: number;
  totalApiCalls: number;
  apiCallsThisMonth: number;
  activeSubscriptions: number;
  periodRevenue: number;
  revenueThisMonth: number;
  totalRevenue: number;
}

// ============================================
// User Types
// ============================================

export interface AdminUser {
  id: number;
  email: string;
  username?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  lastLoginAt?: string;
  // Limits
  cvLimit?: number;
  extraTokens: number;
  cvCount?: number;
  apiUsageCount?: number;
  // Group
  groupId?: number;
  groupName?: string;
  // Subscription (display only)
  plan?: string;
  subscriptionStatus?: string;
  oauthProvider?: string;
  oauthSubject?: string;
}

// ============================================
// Plan Types
// ============================================

export interface AdminPlan {
  id: number;
  name: string;
  description?: string;
  details?: string;
  cvLimit?: number;
  tokenLimit?: number;
  watermark: boolean;
  monthlyPrice: string;
  annualPrice: string;
  currency: string;
  active: boolean;
  // Billing restrictions
  allowAnnualBilling: boolean;
  renewalAllowed: boolean;
  maxBillingCycles?: number;
  // Display settings
  isFeatured: boolean;
  sortOrder: number;
  hasApiAccess?: boolean;
  // Linked group
  linkedGroupId?: number;
  linkedGroupName?: string;
  // Collections
  features: PlanFeature[];
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeature {
  id: number;
  featureKey: string;
  featureName: string;
  featureValue: string;
  description?: string;
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  cvLimit?: number;
  tokenLimit?: number;
  watermark?: boolean;
  monthlyPrice: number;
  annualPrice: number;
  currency?: string;
  active?: boolean;
  // Linked group
  linkedGroupId?: number;
  // Billing restrictions
  allowAnnualBilling?: boolean;
  renewalAllowed?: boolean;
  maxBillingCycles?: number;
  // Display settings
  isFeatured?: boolean;
  sortOrder?: number;
  hasApiAccess?: boolean;
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}

// ============================================
// Promo Codes Types
// ============================================

export type PromoApplicabilityType = "ALL" | "PLAN" | "TOKEN";

export interface PromoCode {
  id: number;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minimumPurchase?: number; // Matches BigDecimal
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string; // Instant or LocalDateTime -> string
  active: boolean;
  applicabilityType: PromoApplicabilityType;
  maxDiscountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ValidatePromoResponse {
  valid: boolean;
  discountAmount: number;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  message?: string;
}

export interface PriceCalculationResponse {
  planId: number;
  planName: string;
  basePrice: number;
  discount: number;
  totalPrice: number;
  promoCode?: string;
  isAnnual: boolean;
  billingCycle: "MONTHLY" | "ANNUAL";
  currency: string;
}

// ============================================
// Subscription Types
// ============================================

export interface AdminSubscription {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  planId: number;
  planName: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";
  billingCycle: "MONTHLY" | "ANNUAL";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
}

// ============================================
// Notification Types
// ============================================

export type NotificationChannel = "PUSH" | "EMAIL" | "ALL";

export interface SendNotificationRequest {
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "PROMO" | "SUCCESS";
  channel?: NotificationChannel;
  broadcast?: boolean;
  userIds?: number[];
}

export interface SendToUsersRequest extends SendNotificationRequest {
  userIds: number[];
}

// ============================================
// Audit Log Types
// ============================================

export type AuditAction =
  | "INSERT"
  | "UPDATE"
  | "DELETE"
  | "READ"
  | "LOGIN"
  | "LOGOUT"
  | "ACTIVATE"
  | "DEACTIVATE";
export interface AuditLog {
  id: number;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  oldValue: Record<string, unknown>;
  newValue: Record<string, unknown>;
  changes: Record<string, unknown>;
  comment?: string;
}

export interface CvOperationLog {
  id: number;
  action: string; // UPLOAD, PARSE, TAILOR, MASK
  source: string; // INTERNAL, EXTERNAL_API
  endpoint: string;
  success: boolean;
  errorMessage?: string;
  processingTimeMs: number;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  // Nested objects map to Map<String, Object> from backend
  requestMetadata?: Record<string, unknown>;
  extractedPii?: Record<string, unknown>;
  // Virtual field for display if needed
  userEmail?: string;
}

// ============================================
// Subscription Audit Log Types
// ============================================

export type SubscriptionAuditType =
  | "RENEW"
  | "REMINDER_SENT"
  | "DOWNGRADE"
  | "EXPIRE"
  | "AUTO_EXTEND"
  | "INVOICE_CREATED"
  | "PAYMENT_RECEIVED"
  | "ACTIVATED"
  | "CANCELLED";

export interface SubscriptionAuditLog {
  id: number;
  userId: number;
  subscriptionId?: number;
  auditType: SubscriptionAuditType;
  invoiceId?: number;
  planId?: number;
  performedBy?: string;
  details?: string;
  createdAt: string;
}

// ============================================
// Billing Audit Log Types
// ============================================

export type BillingAuditType =
  | "WEBHOOK_RECEIVED"
  | "WEBHOOK_SUCCESS"
  | "WEBHOOK_FAILED"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED"
  | "INVOICE_CANCELLED"
  | "INVOICE_EXPIRED"
  | "REFUND_INITIATED";

export interface BillingAuditLog {
  id: number;
  userId?: number;
  auditType: BillingAuditType;
  invoiceId?: number;
  transactionId?: string;
  gateway?: string;
  gatewayInvoiceId?: string;
  gatewayStatus?: string;
  paymentMethod?: string;
  result?: string;
  ipAddress?: string;
  createdAt: string;
}

// ============================================
// Token Usage Log Types
// ============================================

export type TokenUsageType =
  | "CV_PARSE"
  | "CV_TAILOR"
  | "CONTENT_GENERATE"
  | "OTHER";
export type TokenSource = "SUBSCRIPTION" | "WALLET" | "MIXED";

export interface TokenUsageLog {
  id: number;
  userId?: number;
  usageType: TokenUsageType;
  source: TokenSource;
  tokensUsed: number;
  fromSubscription: number;
  fromWallet: number;
  description?: string;
  createdAt: string;
}

// ============================================
// API Endpoints
// ============================================

const ADMIN_API = {
  STATS: "v1/admin/stats",
  USERS: "v1/admin/users",
  PLANS: "v1/admin/plans",
  PROMO_CODES: "v1/admin/promocodes",
  SUBSCRIPTIONS: "v1/admin/subscriptions",
  NOTIFICATIONS: "v1/admin/notifications",
  AUDIT: "v1/admin/audit",
};

// ============================================
// Admin Service
// ============================================

class AdminService {
  // ==========================================
  // Stats
  // ==========================================

  async getStats(
    period: "MONTHLY" | "QUARTERLY" | "YEARLY" | "OVERALL" = "MONTHLY",
  ): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>(
      `${ADMIN_API.STATS}?period=${period}`,
    );
    return response.data;
  }

  // ==========================================
  // Users (Server-side filtering)
  // ==========================================

  async filterUsers(
    inputData: InputDataModel,
  ): Promise<ApiResponse<PagedResponse<AdminUser>>> {
    const response = await apiClient.post<
      ApiResponse<PagedResponse<AdminUser>>
    >(`${ADMIN_API.USERS}/filter`, inputData);
    return response.data;
  }

  async getAllUsers(
    page = 0,
    size = 10,
  ): Promise<ApiResponse<PagedResponse<AdminUser>>> {
    const response = await apiClient.get<ApiResponse<PagedResponse<AdminUser>>>(
      `${ADMIN_API.USERS}?page=${page}&size=${size}`,
    );
    return response.data;
  }

  async getUserById(
    userId: number,
    includeStats = false,
  ): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.get<ApiResponse<AdminUser>>(
      `${ADMIN_API.USERS}/${userId}?includeStats=${includeStats}`,
    );
    return response.data;
  }

  async updateUserLimits(
    userId: number,
    cvLimit?: number,
  ): Promise<ApiResponse<AdminUser>> {
    const params = new URLSearchParams();
    if (cvLimit !== undefined) params.append("cvLimit", cvLimit.toString());

    const response = await apiClient.put<ApiResponse<AdminUser>>(
      `${ADMIN_API.USERS}/${userId}/limits?${params.toString()}`,
      {},
    );
    return response.data;
  }

  async toggleUserLock(userId: number): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.patch<ApiResponse<AdminUser>>(
      `${ADMIN_API.USERS}/${userId}/toggle-lock`,
      {},
    );
    return response.data;
  }

  async updateUserGroup(
    userId: number,
    groupId: number,
  ): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.patch<ApiResponse<AdminUser>>(
      `${ADMIN_API.USERS}/${userId}/group?groupId=${groupId}`,
      {},
    );
    return response.data;
  }

  async updateUserTokens(
    userId: number,
    extraTokens: number,
  ): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.patch<ApiResponse<AdminUser>>(
      `${ADMIN_API.USERS}/${userId}/tokens?extraTokens=${extraTokens}`,
      {},
    );
    return response.data;
  }

  // ==========================================
  // Plans (Client-side filtering - fetch all)
  // ==========================================

  async getPlanLookup(): Promise<{ id: number; name: string }[]> {
    const response = await apiClient.get<{ id: number; name: string }[]>(
      `${ADMIN_API.PLANS}/lookup`,
    );
    return response.data;
  }

  async getAllPlans(): Promise<AdminPlan[]> {
    const response = await apiClient.get<
      ApiResponse<AdminPlan[]> | AdminPlan[]
    >(ADMIN_API.PLANS);
    // Handle both wrapped and unwrapped responses
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    // Wrapped response
    return (data as ApiResponse<AdminPlan[]>).data || [];
  }

  async getPlanById(planId: number): Promise<AdminPlan> {
    const response = await apiClient.get<ApiResponse<AdminPlan>>(
      `${ADMIN_API.PLANS}/${planId}`,
    );
    return response.data.data;
  }

  async createPlan(data: CreatePlanRequest): Promise<ApiResponse<AdminPlan>> {
    const response = await apiClient.post<ApiResponse<AdminPlan>>(
      ADMIN_API.PLANS,
      data,
    );
    return response.data;
  }

  async updatePlan(
    planId: number,
    data: UpdatePlanRequest,
  ): Promise<ApiResponse<AdminPlan>> {
    const response = await apiClient.put<ApiResponse<AdminPlan>>(
      `${ADMIN_API.PLANS}/${planId}`,
      data,
    );
    return response.data;
  }

  async activatePlan(planId: number): Promise<ApiResponse<AdminPlan>> {
    const response = await apiClient.patch<ApiResponse<AdminPlan>>(
      `${ADMIN_API.PLANS}/${planId}/activate`,
      {},
    );
    return response.data;
  }

  async deactivatePlan(planId: number): Promise<ApiResponse<AdminPlan>> {
    const response = await apiClient.patch<ApiResponse<AdminPlan>>(
      `${ADMIN_API.PLANS}/${planId}/deactivate`,
      {},
    );
    return response.data;
  }

  async deletePlan(planId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${ADMIN_API.PLANS}/${planId}`,
    );
    return response.data;
  }

  // ==========================================
  // Promo Codes (Client-side filtering)
  // ==========================================

  async filterPromoCodes(
    data: InputDataModel,
  ): Promise<PagedResponse<PromoCode>> {
    const response = await apiClient.post<
      ApiResponse<PagedResponse<PromoCode>>
    >(`${ADMIN_API.PROMO_CODES}/filter`, data);
    return response.data.data;
  }

  async getAllPromoCodes(): Promise<PromoCode[]> {
    const inputData: InputDataModel = {
      filters: [],
      page: 0,
      size: 1000, // Get all (rarely exceeds 1000)
    };
    const response = await apiClient.post<
      ApiResponse<PagedResponse<PromoCode>>
    >(`${ADMIN_API.PROMO_CODES}/filter`, inputData);
    return response.data.data.content;
  }

  async createPromoCode(
    data: Partial<PromoCode>,
  ): Promise<ApiResponse<PromoCode>> {
    const response = await apiClient.post<ApiResponse<PromoCode>>(
      ADMIN_API.PROMO_CODES,
      data,
    );
    return response.data;
  }

  async updatePromoCode(
    id: number,
    data: Partial<PromoCode>,
  ): Promise<ApiResponse<PromoCode>> {
    const response = await apiClient.put<ApiResponse<PromoCode>>(
      `${ADMIN_API.PROMO_CODES}/${id}`,
      data,
    );
    return response.data;
  }

  async deactivatePromoCode(id: number): Promise<ApiResponse<PromoCode>> {
    const response = await apiClient.post<ApiResponse<PromoCode>>(
      `${ADMIN_API.PROMO_CODES}/${id}/deactivate`,
      {},
    );
    return response.data;
  }

  async deletePromoCode(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${ADMIN_API.PROMO_CODES}/${id}`,
    );
    return response.data;
  }

  /**
   * Calculate subscription price with promo validation.
   * Replaces old validatePromoCode - use this for checkout.
   */
  async calculatePrice(
    planId: number,
    isAnnual: boolean,
    promoCode?: string,
  ): Promise<PriceCalculationResponse> {
    const params = new URLSearchParams();
    params.append("planId", planId.toString());
    params.append("isAnnual", isAnnual.toString());
    if (promoCode) params.append("promoCode", promoCode);

    const response = await apiClient.get<ApiResponse<PriceCalculationResponse>>(
      `v1/subscriptions/calculate-price?${params.toString()}`,
    );
    return response.data.data;
  }

  // ==========================================
  // Subscriptions (Analytics - fetch all)
  // ==========================================

  async getAllSubscriptions(
    status?: string,
    page = 0,
    size = 100,
  ): Promise<PagedResponse<AdminSubscription>> {
    let url = `${ADMIN_API.SUBSCRIPTIONS}?page=${page}&size=${size}`;
    if (status) url += `&status=${status}`;

    const response = await apiClient.get<PagedResponse<AdminSubscription>>(url);
    return response.data;
  }

  // ==========================================
  // Notifications
  // ==========================================

  async sendBroadcast(
    request: SendNotificationRequest,
  ): Promise<{ message: string }> {
    const payload = {
      ...request,
      broadcast: true,
      channel: request.channel || "PUSH",
    };
    const response = await apiClient.post<{ message: string }>(
      `${ADMIN_API.NOTIFICATIONS}/send`,
      payload,
    );
    return response.data;
  }

  async sendToUsers(request: SendToUsersRequest): Promise<{ message: string }> {
    const payload = {
      ...request,
      broadcast: false,
      channel: request.channel || "PUSH",
    };
    const response = await apiClient.post<{ message: string }>(
      `${ADMIN_API.NOTIFICATIONS}/send`,
      payload,
    );
    return response.data;
  }

  async filterSubscriptions(data: InputDataModel): Promise<PagedResponse<any>> {
    const response = await apiClient.post<ApiResponse<PagedResponse<any>>>(
      "v1/admin/subscriptions/filter",
      data,
    );
    return response.data.data;
  }

  async filterApiLogs(data: InputDataModel): Promise<PagedResponse<any>> {
    const response = await apiClient.post<ApiResponse<PagedResponse<any>>>(
      "/v1/logs/admin/filter",
      data,
    );
    return response.data.data;
  }

  // ==========================================
  // Audit Logs
  // ==========================================

  async getCvLogs(
    data: InputDataModel,
  ): Promise<PagedResponse<CvOperationLog>> {
    const response = await apiClient.post<PagedResponse<CvOperationLog>>(
      "/v1/admin/audit/cv-logs",
      data,
    );
    return response.data;
  }

  async getAllAuditLogs(
    data: InputDataModel,
  ): Promise<PagedResponse<AuditLog>> {
    const response = await apiClient.post<PagedResponse<AuditLog>>(
      `${ADMIN_API.AUDIT}/all`,
      data,
    );
    return response.data;
  }

  async getAuditLogsByType(
    entityType: string,
    data: InputDataModel,
  ): Promise<PagedResponse<AuditLog>> {
    const response = await apiClient.post<PagedResponse<AuditLog>>(
      `${ADMIN_API.AUDIT}/${entityType}`,
      data,
    );
    return response.data;
  }

  // ==========================================
  // Subscription Audit Logs
  // ==========================================

  async filterSubscriptionAuditLogs(
    data: InputDataModel,
  ): Promise<PagedResponse<SubscriptionAuditLog>> {
    const response = await apiClient.post<PagedResponse<SubscriptionAuditLog>>(
      "/v1/admin/audit/subscription/filter",
      data,
    );
    return response.data;
  }

  // ==========================================
  // Billing Audit Logs
  // ==========================================

  async filterBillingAuditLogs(
    data: InputDataModel,
  ): Promise<PagedResponse<BillingAuditLog>> {
    const response = await apiClient.post<PagedResponse<BillingAuditLog>>(
      "/v1/admin/audit/billing/filter",
      data,
    );
    return response.data;
  }

  // ==========================================
  // Token Usage Logs (Admin)
  // ==========================================

  async filterTokenUsageLogs(
    data: InputDataModel,
  ): Promise<PagedResponse<TokenUsageLog>> {
    const response = await apiClient.post<PagedResponse<TokenUsageLog>>(
      "/v1/token-usage/admin/filter",
      data,
    );
    return response.data;
  }

  async getUserTokenUsage(
    userId: number,
    page = 0,
    size = 20,
  ): Promise<PagedResponse<TokenUsageLog>> {
    const response = await apiClient.get<PagedResponse<TokenUsageLog>>(
      `/v1/token-usage/admin/user/${userId}?page=${page}&size=${size}`,
    );
    return response.data;
  }
}

export const adminService = new AdminService();
export default adminService;
