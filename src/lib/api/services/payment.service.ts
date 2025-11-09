/**
 * Payment Service
 * Handles all payment-related API calls (Paymob integration)
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import {
  PaymentRequest,
  PaymentInitiationResponse,
  PaymentTransaction,
} from '../types';

/**
 * Payment Service Class
 */
class PaymentService {
  /**
   * Initiate payment for a subscription plan
   */
  async initiatePayment(
    planId: number,
    isAnnual: boolean = false,
    promoCode?: string
  ): Promise<PaymentInitiationResponse> {
    const response = await apiClient.post<{ paymentKey: string; message: string }>(
      API_ENDPOINTS.PAYMENTS.INITIATE,
      null,
      {
        params: {
          planId,
          isAnnual,
          ...(promoCode && { promoCode }),
        },
      }
    );

    // Extract payment key and construct Paymob iframe URL
    const paymentKey = response.paymentKey;
    const iframeId = process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID || '';
    const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

    return {
      paymentKey,
      orderId: '', // Will be populated by backend
      subscriptionId: 0, // Will be populated by backend
      amount: '0', // Will be populated by backend
      currency: 'EGP',
      paymentUrl,
      message: response.message || 'Payment initiated successfully',
    };
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(transactionId: string): Promise<PaymentTransaction> {
    return await apiClient.get<PaymentTransaction>(
      API_ENDPOINTS.PAYMENTS.VERIFY(transactionId)
    );
  }

  /**
   * Get Paymob iframe URL
   */
  getPaymobIframeUrl(paymentKey: string): string {
    const iframeId = process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID || '';
    return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
  }

  /**
   * Check if Paymob is configured
   */
  isPaymobConfigured(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID &&
      process.env.NEXT_PUBLIC_PAYMOB_ENABLED === 'true'
    );
  }

  /**
   * Handle payment success callback
   * This should be called from the payment success page
   */
  async handlePaymentSuccess(
    transactionId: string,
    subscriptionId?: number
  ): Promise<PaymentTransaction> {
    // Verify the payment with backend
    const transaction = await this.verifyPayment(transactionId);

    // Check if payment was successful
    if (transaction.status !== 'COMPLETED') {
      throw new Error('Payment verification failed');
    }

    return transaction;
  }

  /**
   * Handle payment failure callback
   * This should be called from the payment failure page
   */
  handlePaymentFailure(error?: string): void {
    console.error('Payment failed:', error);
    // You can add additional error tracking here
  }

  /**
   * Parse Paymob callback parameters
   * Paymob sends callback data as query parameters
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
    const transactionId = searchParams.get('id') || undefined;
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

  /**
   * Validate Paymob HMAC signature
   * This is used to verify that the callback is genuinely from Paymob
   */
  async validateHmacSignature(
    data: Record<string, any>,
    receivedHmac: string
  ): Promise<boolean> {
    const hmacSecret = process.env.NEXT_PUBLIC_PAYMOB_HMAC_SECRET;

    if (!hmacSecret) {
      console.warn('HMAC secret not configured');
      return false;
    }

    try {
      // Concatenate values in specific order as per Paymob documentation
      const concatenatedString = [
        data.amount_cents,
        data.created_at,
        data.currency,
        data.error_occured,
        data.has_parent_transaction,
        data.id,
        data.integration_id,
        data.is_3d_secure,
        data.is_auth,
        data.is_capture,
        data.is_refunded,
        data.is_standalone_payment,
        data.is_voided,
        data.order,
        data.owner,
        data.pending,
        data.source_data_pan,
        data.source_data_sub_type,
        data.source_data_type,
        data.success,
      ].join('');

      // Calculate HMAC
      const encoder = new TextEncoder();
      const keyData = encoder.encode(hmacSecret);
      const messageData = encoder.encode(concatenatedString);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const hashArray = Array.from(new Uint8Array(signature));
      const calculatedHmac = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      return calculatedHmac === receivedHmac;
    } catch (error) {
      console.error('HMAC validation error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Export class for testing
export { PaymentService };

