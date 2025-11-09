/**
 * Admin Plan Management Service
 * Handles all admin operations for subscription plan management
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  SubscriptionPlan,
  PlanWithStats,
  CreatePlanRequest,
  UpdatePlanRequest,
  ApiResponse,
} from '../types';

/**
 * Get all subscription plans (including inactive)
 * Admin only
 */
export async function getAllPlansAdmin(): Promise<SubscriptionPlan[]> {
  const response = await apiClient.get<SubscriptionPlan[]>(
    API_ENDPOINTS.ADMIN.PLANS.ALL
  );
  return response.data;
}

/**
 * Get a specific plan with statistics
 * Admin only
 */
export async function getPlanWithStats(planId: number): Promise<PlanWithStats> {
  const response = await apiClient.get<PlanWithStats>(
    API_ENDPOINTS.ADMIN.PLANS.BY_ID(planId)
  );
  return response.data;
}

/**
 * Create a new subscription plan
 * Admin only
 */
export async function createPlan(
  planData: CreatePlanRequest
): Promise<ApiResponse<SubscriptionPlan>> {
  const response = await apiClient.post<ApiResponse<SubscriptionPlan>>(
    API_ENDPOINTS.ADMIN.PLANS.CREATE,
    planData
  );
  return response.data;
}

/**
 * Update an existing subscription plan
 * Admin only
 */
export async function updatePlan(
  planId: number,
  planData: UpdatePlanRequest
): Promise<ApiResponse<SubscriptionPlan>> {
  const response = await apiClient.put<ApiResponse<SubscriptionPlan>>(
    API_ENDPOINTS.ADMIN.PLANS.UPDATE(planId),
    planData
  );
  return response.data;
}

/**
 * Activate a subscription plan
 * Admin only
 */
export async function activatePlan(
  planId: number
): Promise<ApiResponse<SubscriptionPlan>> {
  const response = await apiClient.patch<ApiResponse<SubscriptionPlan>>(
    API_ENDPOINTS.ADMIN.PLANS.ACTIVATE(planId)
  );
  return response.data;
}

/**
 * Deactivate a subscription plan
 * Admin only
 */
export async function deactivatePlan(
  planId: number
): Promise<ApiResponse<SubscriptionPlan>> {
  const response = await apiClient.patch<ApiResponse<SubscriptionPlan>>(
    API_ENDPOINTS.ADMIN.PLANS.DEACTIVATE(planId)
  );
  return response.data;
}

/**
 * Delete a subscription plan (soft delete)
 * Admin only
 */
export async function deletePlan(planId: number): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    API_ENDPOINTS.ADMIN.PLANS.DELETE(planId)
  );
  return response.data;
}

// Export all functions as a service object
export const adminPlanService = {
  getAllPlansAdmin,
  getPlanWithStats,
  createPlan,
  updatePlan,
  activatePlan,
  deactivatePlan,
  deletePlan,
};

