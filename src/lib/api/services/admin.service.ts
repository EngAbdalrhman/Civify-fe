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
   * Set user CV limit
   */
  async setUserCVLimit(userId: string, limit: number): Promise<void> {
    await apiClient.patch(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/cv-limit`, { limit });
  }

  /**
   * Set user API rate limit
   */
  async setUserApiLimit(userId: string, limit: number): Promise<void> {
    await apiClient.patch(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/api-limit`, { limit });
  }
}

export const adminService = new AdminService();
