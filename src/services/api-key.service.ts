import apiClient from '@/api/client';

export interface ApiKey {
  id: number;
  keyHash: string;
  keyPreview: string;
  name?: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  user?: any;
}

export interface CreateApiKeyResponse {
  key: string;
}

class ApiKeyService {
  /**
   * Get all API keys for the current user
   */
  async getUserApiKeys(): Promise<ApiKey[]> {
    const response = await apiClient.get<ApiKey[]>('/api-keys');
    return response.data;
  }

  /**
   * Create a new API key
   */
  async createApiKey(): Promise<string> {
    const response = await apiClient.post<CreateApiKeyResponse>('/api-keys');
    return response.data.key;
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(id: number): Promise<void> {
    await apiClient.delete(`/api-keys/${id}`);
  }
}

export const apiKeyService = new ApiKeyService();
