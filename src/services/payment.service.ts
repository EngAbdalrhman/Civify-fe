/**
 * Payment Service
 * Handles all payment-related API calls for Fawaterk and Paymob integration
 */

import apiClient from '@/api/client';
import type { PaymentInitiationResponse, PaymentTransaction } from '@/features/plans/types';

const API_ENDPOINTS = {
  INITIATE: '/v1/payments/initiate',
  VERIFY: (transactionId: string) => `/v1/payments/verify/${transactionId}`,
  CONFIG: '/v1/payments/config',
};

class PaymentService {
  /**
   * Initiate payment for a subscription plan
   */
  async initiatePayment(
    planId: number,
    isAnnual: boolean = false,
    promoCode?: string,
    gateway?: string,
    paymentMethod?: string,
    currency?: string
  ): Promise<PaymentInitiationResponse> {
    const params = new URLSearchParams({
      planId: planId.toString(),
      isAnnual: isAnnual.toString(),
    });

    if (promoCode) {
      params.append('promoCode', promoCode);
    }

    if (gateway) {
      params.append('gateway', gateway);
    }

    if (paymentMethod) {
      params.append('paymentMethod', paymentMethod);
    }

    if (currency) {
      params.append('currency', currency);
    }

    const response = await apiClient.post<PaymentInitiationResponse>(
      `${API_ENDPOINTS.INITIATE}?${params.toString()}`
    );

    return response.data;
  }

  /**
   * Get enabled payment gateways
   */
  async getEnabledGateways(): Promise<string[]> {
    const response = await apiClient.get<{ enabledGateways: string[] }>(API_ENDPOINTS.CONFIG);
    return response.data.enabledGateways;
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(transactionId: string, gateway?: string): Promise<{ verified: boolean; message: string }> {
    const url = gateway
      ? `${API_ENDPOINTS.VERIFY(transactionId)}?gateway=${gateway}`
      : API_ENDPOINTS.VERIFY(transactionId);
    const response = await apiClient.get<{ verified: boolean; message: string }>(url);
    return response.data;
  }

  /**
   * Handle payment success with retry logic
   */
  async handlePaymentSuccess(
    transactionId: string,
    gateway?: string,
    maxRetries: number = 5,
    retryDelay: number = 2000
  ): Promise<{ verified: boolean; message: string }> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await this.verifyPayment(transactionId, gateway);
        
        if (result.verified) {
          return result;
        }

        // If not verified yet, wait and retry
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        throw error;
      }
    }

    return { verified: false, message: 'Payment verification timed out' };
  }

  /**
   * Parse Fawaterak callback parameters from URL
   */
  parseFawaterakCallback(searchParams: URLSearchParams): {
    success: boolean;
    transactionId?: string;
    orderId?: string;
    invoiceKey?: string;
    status?: string;
    error?: string;
  } {
    let status = searchParams.get('invoice_status') || searchParams.get('status');
    const invoiceId = searchParams.get('invoice_id');
    const invoiceKey = searchParams.get('invoice_key') || searchParams.get('payment_key');

    // If status is missing but we have IDs, this is a success callback
    if (!status && invoiceId && invoiceKey) {
      status = 'paid';
    }

    const success = status === 'paid' || status === 'success';
    // const orderId = searchParams.get('invoice_id') || undefined; // Already defined above
    const error = !success 
      ? (searchParams.get('error') || `Payment status: ${status || 'unknown'}`) 
      : undefined;

    return {
      success,
      transactionId: invoiceKey || undefined,
      orderId: invoiceId || undefined,
      invoiceKey: invoiceKey || undefined,
      status: status || undefined,
      error,
    };
  }

  /**
   * Parse Paymob callback parameters from URL
   */
  parsePaymobCallback(searchParams: URLSearchParams): {
    success: boolean;
    transactionId?: string;
    orderId?: string;
    amount?: string;
    currency?: string;
    error?: string;
  } {
    const success = searchParams.get('success') === 'true';
    // Use 'order' as transactionId because that's what we store in Invoice.paymentTransactionId
    const transactionId = searchParams.get('order') || undefined;
    const orderId = searchParams.get('order') || undefined;
    const amount = searchParams.get('amount_cents') || undefined;
    const currency = searchParams.get('currency') || undefined;
    const error = searchParams.get('error') || undefined;

    return {
      success,
      transactionId,
      orderId,
      amount,
      currency,
      error,
    };
  }
}

export const paymentService = new PaymentService();
export { PaymentService };
