/**
 * API Usage Logs Service
 * Handles fetching user's API usage logs
 */

import apiClient from '@/api/client';

export interface ApiUsageLog {
  id: number;
  userId?: number;
  userEmail?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  success: boolean;
  ipAddress: string | null;
  errorMessage: string | null;
  timestamp: string;
  apiKeyId: number | null;
}

export interface ApiUsageLogsResponse {
  content: ApiUsageLog[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface ApiUsageStats {
  totalCalls: number;
  successCount: number;
  failureCount: number;
  thisMonthCalls: number;
  successRate: number;
}

interface FilterInput {
  page?: number;
  size?: number;
  filters?: Array<{
    fieldName: string;
    operation: string;
    value: string | number | boolean;
  }>;
  sorts?: Array<{
    fieldName: string;
    direction: 'ASC' | 'DESC';
  }>;
}

const API_ENDPOINTS = {
  MY_LOGS_FILTER: '/v1/logs/my-logs/filter',
  MY_STATS: '/v1/logs/my-stats',
  ADMIN_FILTER: '/v1/logs/admin/filter',
};

class ApiUsageService {
  /**
   * Get current user's API usage logs (filtered by current month automatically)
   */
  async getMyLogs(params: {
    page?: number;
    size?: number;
    endpoint?: string;
  } = {}): Promise<ApiUsageLogsResponse> {
    const input: FilterInput = {
      page: params.page ?? 0,
      size: params.size ?? 20,
      filters: [],
      sorts: [{ fieldName: 'timestamp', direction: 'DESC' }]
    };

    // Add endpoint filter if provided
    if (params.endpoint) {
      input.filters?.push({
        fieldName: 'endpoint',
        operation: 'MATCH',
        value: params.endpoint,
      });
    }

    const response = await apiClient.post<{ data: ApiUsageLogsResponse }>(
      API_ENDPOINTS.MY_LOGS_FILTER,
      input
    );
    return response.data.data;
  }

  /**
   * Get current user's API usage statistics
   */
  async getMyStats(): Promise<ApiUsageStats> {
    const response = await apiClient.get<{ data: ApiUsageStats }>(API_ENDPOINTS.MY_STATS);
    return response.data.data;
  }

  /**
   * Admin: Get all API usage logs with filtering
   */
  async getAdminLogs(params: {
    page?: number;
    size?: number;
    endpoint?: string;
    email?: string;
    method?: string;
    statusCode?: number;
  } = {}): Promise<ApiUsageLogsResponse> {
    const input: FilterInput = {
      page: params.page ?? 0,
      size: params.size ?? 20,
      filters: [],
      sorts: [{ fieldName: 'timestamp', direction: 'DESC' }]
    };

    if (params.endpoint) {
      input.filters?.push({ fieldName: 'endpoint', operation: 'MATCH', value: params.endpoint });
    }
    if (params.email) {
      input.filters?.push({ fieldName: 'user.email', operation: 'EQUAL', value: params.email });
    }
    if (params.method) {
      input.filters?.push({ fieldName: 'method', operation: 'EQUAL', value: params.method });
    }
    if (params.statusCode) {
      input.filters?.push({ fieldName: 'statusCode', operation: 'EQUAL', value: params.statusCode });
    }

    const response = await apiClient.post<{ data: ApiUsageLogsResponse }>(
      API_ENDPOINTS.ADMIN_FILTER,
      input
    );
    return response.data.data;
  }
}

export const apiUsageService = new ApiUsageService();
export { ApiUsageService };

