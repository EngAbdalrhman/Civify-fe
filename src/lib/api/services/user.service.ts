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
  async createApiKey(name: string): Promise<ApiKey> {
    return await apiClient.post<ApiKey>(API_ENDPOINTS.USERS.API_KEYS, { name });
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
    return await apiClient.get<ApiUsageLog[]>(API_ENDPOINTS.USERS.API_USAGE);
  }
}

export const userService = new UserService();
