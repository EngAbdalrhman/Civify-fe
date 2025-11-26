import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { AdminStats, UserProfile, ApiResponse } from '@/lib/types';
import { FilterOperation } from '@/components/generic-list/types';

// Filter request types (matching backend InputDataModel)
export interface FilterCriteria {
  fieldName: string;
  operation: FilterOperation;
  value: any;
  value2?: any;
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

export class AdminService {
  /**
   * Get admin stats
   */
  async getStats(): Promise<AdminStats> {
    return await apiClient.get<AdminStats>(API_ENDPOINTS.ADMIN.STATS);
  }

  /**
   * Get all users (admin) - Simple method without filtering
   */
  async getUsers(): Promise<UserProfile[]> {
    return await apiClient.get<UserProfile[]>(API_ENDPOINTS.ADMIN.USERS);
  }

  /**
   * Filter users with advanced criteria (admin)
   */
  async filterUsers(inputData: InputDataModel): Promise<ApiResponse<PagedResponse<UserProfile>>> {
    return await apiClient.post<ApiResponse<PagedResponse<UserProfile>>>(
      `${API_ENDPOINTS.ADMIN.USERS}/filter`,
      inputData
    );
  }

  /**
   * Get user by ID (admin)
   */
  async getUser(userId: string): Promise<UserProfile> {
    return await apiClient.get<UserProfile>(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`);
  }

  /**
   * Update user (admin)
   */
  async updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return await apiClient.patch<UserProfile>(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`, data);
  }

  /**
   * Delete user (admin)
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`);
  }

  /**
   * Filter plans with advanced criteria (admin)
   */
  async filterPlans(inputData: InputDataModel): Promise<ApiResponse<PagedResponse<any>>> {
    return await apiClient.post<ApiResponse<PagedResponse<any>>>(
      `${API_ENDPOINTS.ADMIN.PLANS.ALL}/filter`,
      inputData
    );
  }

  /**
   * Create plan (admin)
   */
  async createPlan(data: any): Promise<ApiResponse<any>> {
    return await apiClient.post<ApiResponse<any>>(API_ENDPOINTS.ADMIN.PLANS.CREATE, data);
  }

  /**
   * Update plan (admin)
   */
  async updatePlan(planId: number, data: any): Promise<ApiResponse<any>> {
    return await apiClient.put<ApiResponse<any>>(API_ENDPOINTS.ADMIN.PLANS.UPDATE(planId), data);
  }

  /**
   * Activate plan (admin)
   */
  async activatePlan(planId: number): Promise<ApiResponse<any>> {
    return await apiClient.patch<ApiResponse<any>>(API_ENDPOINTS.ADMIN.PLANS.ACTIVATE(planId), {});
  }

  /**
   * Deactivate plan (admin)
   */
  async deactivatePlan(planId: number): Promise<ApiResponse<any>> {
    return await apiClient.patch<ApiResponse<any>>(API_ENDPOINTS.ADMIN.PLANS.DEACTIVATE(planId), {});
  }

  /**
   * Delete plan (admin)
   */
  async deletePlan(planId: number): Promise<ApiResponse<void>> {
    return await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.ADMIN.PLANS.DELETE(planId));
  }

  /**
   * Update user limits (admin)
   */
  async updateUserLimits(userId: string, cvLimit?: number, apiLimit?: number): Promise<ApiResponse<UserProfile>> {
    const params = new URLSearchParams();
    if (cvLimit !== undefined) params.append('cvLimit', cvLimit.toString());
    if (apiLimit !== undefined) params.append('apiLimit', apiLimit.toString());
    
    return await apiClient.put<ApiResponse<UserProfile>>(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/limits?${params.toString()}`, {});
  }
}

export const adminService = new AdminService();
