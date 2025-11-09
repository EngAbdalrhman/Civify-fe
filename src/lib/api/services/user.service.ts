/**
 * User Service
 * Handles all user-related API calls
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { User } from '../types';

/**
 * User Service Class
 */
class UserService {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>(API_ENDPOINTS.USERS.ME);
  }

  /**
   * Get all users (admin/licensed users only)
   */
  async getAllUsers(): Promise<User[]> {
    return await apiClient.get<User[]>(API_ENDPOINTS.USERS.ALL);
  }

  /**
   * Get user by ID (admin/licensed users only)
   */
  async getUserById(userId: number): Promise<User> {
    return await apiClient.get<User>(API_ENDPOINTS.USERS.BY_ID(userId));
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    return await apiClient.put<User>(API_ENDPOINTS.USERS.ME, data);
  }
}

// Export singleton instance
export const userService = new UserService();

// Export class for testing
export { UserService };

