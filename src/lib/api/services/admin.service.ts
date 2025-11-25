import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { AdminStats, UserProfile } from '@/lib/types';

export class AdminService {
  /**
   * Get admin stats
   */
  async getStats(): Promise<AdminStats> {
    return await apiClient.get<AdminStats>(API_ENDPOINTS.ADMIN.STATS);
  }

  /**
   * Get all users (admin)
   */
  async getUsers(): Promise<UserProfile[]> {
    return await apiClient.get<UserProfile[]>(API_ENDPOINTS.ADMIN.USERS);
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
