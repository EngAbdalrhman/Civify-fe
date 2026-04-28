/**
 * Token Package Service
 * Handles API calls for token packages purchasing
 */

import apiClient from '@/api/client';

export interface TokenPackage {
  id: number;
  name: string;
  tokens: number;
  price: number;
  currency: string;
  description?: string;
  active: boolean;
}

export interface TokenPurchaseResult {
  success: boolean;
  paymentKey?: string;
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
}

export interface TokenBalanceResponse {
  walletTokens: number;
  monthlyLimit: number | null;
  monthlyUsed: number;
  monthlyRemaining: number;
  totalAvailable: number;
}

export interface PurchasePreviewResponse {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  currency: string;
  promoCode: string;
  promoApplied: boolean;
  message?: string;
}

const API_ENDPOINTS = {
  PACKAGES: '/v1/tokens/packages',
  BALANCE: '/v1/tokens/balance',
  PURCHASE: (packageId: number) => `/v1/tokens/purchase/${packageId}`,
};

class TokenPackageService {
  /**
   * Get all available token packages
   */
  async getPackages(): Promise<TokenPackage[]> {
    const response = await apiClient.get<TokenPackage[]>(API_ENDPOINTS.PACKAGES);
    return response.data;
  }

  /**
   * Get user's token balance
   */
  async getBalance(): Promise<TokenBalanceResponse> {
    const response = await apiClient.get<TokenBalanceResponse>(API_ENDPOINTS.BALANCE);
    return response.data;
  }



  /**
   * Preview a purchase (calculate discount)
   */
  async previewPurchase(packageId: number, promoCode: string): Promise<PurchasePreviewResponse> {
    const params = new URLSearchParams();
    params.append('promoCode', promoCode);
    
    const response = await apiClient.get<PurchasePreviewResponse>(
      `${API_ENDPOINTS.PURCHASE(packageId)}/preview?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Purchase a token package
   */
  async purchasePackage(
    packageId: number,
    promoCode?: string,
    gateway?: string,
    paymentMethod?: string,
    phoneNumber?: string,
  ): Promise<TokenPurchaseResult> {
    const params = new URLSearchParams();
    if (promoCode) {
      params.append('promoCode', promoCode);
    }
    if (gateway) {
      params.append('gateway', gateway);
    }
    if (paymentMethod) {
      params.append('paymentMethod', paymentMethod);
    }
    if (phoneNumber) {
      params.append('phoneNumber', phoneNumber);
    }
    
    const response = await apiClient.post<TokenPurchaseResult>(
      `${API_ENDPOINTS.PURCHASE(packageId)}${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  }

  /**
   * Format token count for display (e.g., 5000 -> "5K")
   */
  formatTokens(tokens: number): string {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(tokens % 1000000 === 0 ? 0 : 1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(tokens % 1000 === 0 ? 0 : 1)}K`;
    }
    return tokens.toString();
  }

  /**
   * Calculate price per token
   */
  getPricePerToken(price: number, tokens: number): string {
    if (tokens === 0) return '0';
    return (price / tokens).toFixed(4);
  }
}

export const tokenPackageService = new TokenPackageService();
export { TokenPackageService };
