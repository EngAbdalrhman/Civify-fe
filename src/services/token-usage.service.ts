/**
 * Token Usage Service
 * Handles user token usage tracking API calls
 */

import apiClient from '@/api/client';

export interface TokenUsageLog {
  id: number;
  usageType: 'CV_PARSE' | 'CV_TAILOR' | 'CONTENT_GENERATE' | 'OTHER';
  source: 'SUBSCRIPTION' | 'WALLET' | 'MIXED';
  tokensUsed: number;
  fromSubscription: number;
  fromWallet: number;
  description?: string;
  createdAt: string;
}

export interface TokenUsageSummary {
  totalTokensUsed: number;
  fromSubscription: number;
  fromWallet: number;
  periodStart: string;
  periodEnd: string;
}

export interface PagedResponse<T> {
  content: T[];
  number: number; // Page number
  size: number;
  totalElements: number;
  totalPages: number;
}

const TOKEN_USAGE_API = {
  MY_USAGE: '/v1/token-usage/users/me',
  MY_SUMMARY: '/v1/token-usage/users/me/summary',
};

class TokenUsageService {
  async getMyUsageHistory(page = 0, size = 20): Promise<PagedResponse<TokenUsageLog>> {
    const response = await apiClient.get<PagedResponse<TokenUsageLog>>(
      `${TOKEN_USAGE_API.MY_USAGE}?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getMySummary(): Promise<TokenUsageSummary> {
    const response = await apiClient.get<TokenUsageSummary>(TOKEN_USAGE_API.MY_SUMMARY);
    return response.data;
  }
}

export const tokenUsageService = new TokenUsageService();
export default tokenUsageService;
