/**
 * Admin API Service
 * Handles all admin operations for the HICv dashboard
 */

import apiClient from '@/api/client';

// ============================================
// Types matching backend InputDataModel
// ============================================

export enum FilterOperation {
  // Comparison Operations
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN_EQUAL = 'GREATER_THAN_EQUAL',
  LESS_THAN_EQUAL = 'LESS_THAN_EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  EQUAL = 'EQUAL',
  // String Operations
  MATCH = 'MATCH',
  MATCH_START = 'MATCH_START',
  MATCH_END = 'MATCH_END',
  MATCH_EXACT = 'MATCH_EXACT',
  // Collection Operations
  IN_STRING_LIST = 'IN_STRING_LIST',
  NOT_IN_STRING_LIST = 'NOT_IN_STRING_LIST',
  // Null Operations
  IS_NOT_NULL = 'IS_NOT_NULL',
  IS_NULL = 'IS_NULL',
  // Date Operations
  DATE_GREATER_THAN = 'DATE_GREATER_THAN',
  DATE_LESS_THAN = 'DATE_LESS_THAN',
  DATE_BETWEEN = 'DATE_BETWEEN',
}

export interface FilterCriteria {
  fieldName: string;
  operation: FilterOperation;
  value: unknown;
  value2?: unknown;
}

export interface SortCriteria {
  fieldName: string;
  direction: 'ASC' | 'DESC';
}

export interface FilterGroup {
  operation: 'AND' | 'OR' | 'NOT';
  filters: FilterCriteria[];
  groups?: FilterGroup[];
}

export interface InputDataModel {
  filters: FilterCriteria[];
  filterGroups?: FilterGroup[];
  operation?: 'AND' | 'OR' | 'NOT';
  sorts?: SortCriteria[];
  page: number;
  size: number;
}

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
}

// ============================================
// User Types
// ============================================

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  photoUrl?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  accountLocked: boolean;
  createdAt: string;
  lastLoginAt?: string;
  customCvLimit?: number;
  customApiLimit?: number;
  currentPlan?: string;
  subscriptionStatus?: string;
}

// ============================================
// Plan Types
// ============================================

export interface AdminPlan {
  id: number;
  name: string;
  description?: string;
  monthlyPrice: string;
  annualPrice: string;
  features: PlanFeature[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  maxBillingCycles?: number;
  allowAnnualBilling: boolean;
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
  monthlyPrice: number;
  annualPrice: number;
  features: { featureKey: string; featureValue: string }[];
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}

// ============================================
// Promo Code Types
// ============================================

export interface PromoCode {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUses?: number;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicablePlans?: number[];
  minPurchaseAmount?: number;
  createdAt: string;
}

export interface ValidatePromoResponse {
  valid: boolean;
  discountAmount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  message?: string;
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
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  billingCycle: 'MONTHLY' | 'ANNUAL';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
}

// ============================================
// Notification Types
// ============================================

export interface SendNotificationRequest {
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'PROMO' | 'SUCCESS';
}

export interface SendToUsersRequest extends SendNotificationRequest {
  userIds: number[];
}

// ============================================
// API Endpoints
// ============================================

const ADMIN_API = {
  STATS: 'v1/admin/stats',
  USERS: 'v1/admin/users',
  PLANS: 'v1/admin/plans',
  PROMO_CODES: 'v1/admin/promocodes',
  SUBSCRIPTIONS: 'v1/admin/subscriptions',
  NOTIFICATIONS: 'v1/admin/notifications',
};

// ============================================
// Admin Service
// ============================================

class AdminService {
  // ==========================================
  // Stats
  // ==========================================

  async getStats(period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'OVERALL' = 'MONTHLY'): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>(`${ADMIN_API.STATS}?period=${period}`);
    return response.data;
  }

  // ==========================================
  // Users (Server-side filtering)
  // ==========================================

  async filterUsers(inputData: InputDataModel): Promise<ApiResponse<PagedResponse<AdminUser>>> {
    const response = await apiClient.post<ApiResponse<PagedResponse<AdminUser>>>(
      `${ADMIN_API.USERS}/filter`,
      inputData
    );
    return response.data;
  }

  async getAllUsers(page = 0, size = 10): Promise<ApiResponse<PagedResponse<AdminUser>>> {
    const response = await apiClient.get<ApiResponse<PagedResponse<AdminUser>>>(
      `${ADMIN_API.USERS}?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getUserById(userId: number, includeStats = false): Promise<ApiResponse<AdminUser>> {
    const response = await apiClient.get<ApiResponse<AdminUser>>(
      `${ADMIN_API.USERS}/${userId}?includeStats=${includeStats}`
    );
    return response.data;
  }

  async updateUserLimits(
    userId: number,
    cvLimit?: number,
    apiLimit?: number
  ): Promise<ApiResponse<AdminUser>> {
    const params = new URLSearchParams();
    if (cvLimit !== undefined) params.append('cvLimit', cvLimit.toString());
    if (apiLimit !== undefined) params.append('apiLimit', apiLimit.toString());

    const response = await apiClient.put<ApiResponse<AdminUser>>(
      `${ADMIN_API.USERS}/${userId}/limits?${params.toString()}`,
      {}
    );
    return response.data;
  }

  // ==========================================
  // Plans (Client-side filtering - fetch all)
  // ==========================================

  async getAllPlans(): Promise<AdminPlan[]> {
    const response = await apiClient.get<ApiResponse<AdminPlan[]> | AdminPlan[]>(ADMIN_API.PLANS);
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
      `${ADMIN_API.PLANS}/${planId}`
    );
    return response.data.data;
  }

  async createPlan(data: CreatePlanRequest): Promise<ApiResponse<AdminPlan>> {
    const response = await apiClient.post<ApiResponse<AdminPlan>>(
      ADMIN_API.PLANS,
      data
    );
    return response.data;
  }

  async updatePlan(planId: number, data: UpdatePlanRequest): Promise<ApiResponse<AdminPlan>> {
    const response = await apiClient.put<ApiResponse<AdminPlan>>(
      `${ADMIN_API.PLANS}/${planId}`,
      data
    );
    return response.data;
  }

  async activatePlan(planId: number): Promise<ApiResponse<AdminPlan>> {
    const response = await apiClient.patch<ApiResponse<AdminPlan>>(
      `${ADMIN_API.PLANS}/${planId}/activate`,
      {}
    );
    return response.data;
  }

  async deactivatePlan(planId: number): Promise<ApiResponse<AdminPlan>> {
    const response = await apiClient.patch<ApiResponse<AdminPlan>>(
      `${ADMIN_API.PLANS}/${planId}/deactivate`,
      {}
    );
    return response.data;
  }

  async deletePlan(planId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${ADMIN_API.PLANS}/${planId}`
    );
    return response.data;
  }

  // ==========================================
  // Promo Codes (Client-side filtering)
  // ==========================================

  async getAllPromoCodes(): Promise<PromoCode[]> {
    const inputData: InputDataModel = {
      filters: [],
      page: 0,
      size: 1000, // Get all (rarely exceeds 1000)
    };
    const response = await apiClient.post<ApiResponse<PagedResponse<PromoCode>>>(
      `${ADMIN_API.PROMO_CODES}/filter`,
      inputData
    );
    return response.data.data.content;
  }

  async createPromoCode(data: Partial<PromoCode>): Promise<ApiResponse<PromoCode>> {
    const response = await apiClient.post<ApiResponse<PromoCode>>(
      ADMIN_API.PROMO_CODES,
      data
    );
    return response.data;
  }

  async updatePromoCode(id: number, data: Partial<PromoCode>): Promise<ApiResponse<PromoCode>> {
    const response = await apiClient.put<ApiResponse<PromoCode>>(
      `${ADMIN_API.PROMO_CODES}/${id}`,
      data
    );
    return response.data;
  }

  async deactivatePromoCode(id: number): Promise<ApiResponse<PromoCode>> {
    const response = await apiClient.post<ApiResponse<PromoCode>>(
      `${ADMIN_API.PROMO_CODES}/${id}/deactivate`,
      {}
    );
    return response.data;
  }

  async deletePromoCode(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${ADMIN_API.PROMO_CODES}/${id}`
    );
    return response.data;
  }

  async validatePromoCode(
    code: string,
    planId: number,
    amount: number
  ): Promise<ValidatePromoResponse> {
    // Use public subscription endpoint for checkout promo validation
    const response = await apiClient.post<ValidatePromoResponse>(
      'v1/subscriptions/validate-promo',
      { code, planId, amount }
    );
    return response.data;
  }

  // ==========================================
  // Subscriptions (Analytics - fetch all)
  // ==========================================

  async getAllSubscriptions(status?: string, page = 0, size = 100): Promise<PagedResponse<AdminSubscription>> {
    let url = `${ADMIN_API.SUBSCRIPTIONS}?page=${page}&size=${size}`;
    if (status) url += `&status=${status}`;
    
    const response = await apiClient.get<PagedResponse<AdminSubscription>>(url);
    return response.data;
  }

  // ==========================================
  // Notifications
  // ==========================================

  async sendBroadcast(request: SendNotificationRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${ADMIN_API.NOTIFICATIONS}/send-all`,
      request
    );
    return response.data;
  }

  async sendToUsers(request: SendToUsersRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${ADMIN_API.NOTIFICATIONS}/send-to-users`,
      request
    );
    return response.data;
  }
}

export const adminService = new AdminService();
export default adminService;
