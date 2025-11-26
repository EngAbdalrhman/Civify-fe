import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { UserProfile, ApiKey, ApiUsageLog } from '@/lib/types';

export class UserService {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    return await apiClient.get<UserProfile>(API_ENDPOINTS.USERS.PROFILE);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return await apiClient.patch<UserProfile>(API_ENDPOINTS.USERS.PROFILE, data);
  }

  /**
   * Get API keys
   */
  async getApiKeys(): Promise<ApiKey[]> {
    return await apiClient.get<ApiKey[]>(API_ENDPOINTS.USERS.API_KEYS);
  }

  /**
   * Create API key
   */
  async createApiKey(): Promise<{ key: string }> {
    return await apiClient.post<{ key: string }>(API_ENDPOINTS.USERS.API_KEYS);
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.USERS.API_KEYS}/${keyId}`);
  }

  /**
   * Get API usage logs
   */
  async getApiUsage(): Promise<ApiUsageLog[]> {
    // TODO: Implement backend endpoint for API usage logs
    // return await apiClient.get<ApiUsageLog[]>(API_ENDPOINTS.USERS.API_USAGE);
    return [];
  }

  /**
   * Get API usage count for this month
   */
  async getApiUsageThisMonth(): Promise<number> {
    const logs = await this.getApiUsage();
    // Simple client-side calculation for now, ideally backend should provide this
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    }).length;
  }
}

export const userService = new UserService();
