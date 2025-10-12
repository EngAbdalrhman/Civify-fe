/**
 * PayPal Payment Service
 * 
 * IMPORTANT: This service is READY but DISABLED by default.
 * To enable:
 * 1. Create PayPal developer account at https://developer.paypal.com
 * 2. Create an app and get Client ID and Secret
 * 3. Add environment variables to .env.local
 * 4. Set NEXT_PUBLIC_PAYPAL_ENABLED=true
 */

// Check if PayPal is enabled
export const isPayPalEnabled = () => {
  return process.env.NEXT_PUBLIC_PAYPAL_ENABLED === 'true';
};

export interface PayPalPaymentData {
  amount: string; // e.g., "9.99"
  currency: string; // 'USD'
  description: string;
  userId: string;
  planId: string;
  planName: string;
}

export interface PayPalConfig {
  clientId: string;
  secret: string;
  mode: 'sandbox' | 'live';
}

export class PayPalService {
  private config: PayPalConfig;
  private baseUrl: string;

  constructor(config?: PayPalConfig) {
    // Use provided config or load from environment
    this.config = config || {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      secret: process.env.PAYPAL_SECRET || '',
      mode: (process.env.PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox',
    };

    this.baseUrl =
      this.config.mode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
  }

  /**
   * Check if PayPal is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.clientId && this.config.secret);
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.config.clientId}:${this.config.secret}`).toString('base64');

      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error('Failed to get PayPal access token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error: any) {
      console.error('PayPal auth error:', error);
      throw new Error('Failed to authenticate with PayPal');
    }
  }

  /**
   * Create order
   */
  async createOrder(paymentData: PayPalPaymentData): Promise<string> {
    try {
      if (!this.isConfigured()) {
        throw new Error('PayPal is not properly configured');
      }

      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: paymentData.currency,
                value: paymentData.amount,
              },
              description: paymentData.description,
              custom_id: JSON.stringify({
                userId: paymentData.userId,
                planId: paymentData.planId,
                planName: paymentData.planName,
              }),
            },
          ],
          application_context: {
            brand_name: 'HICv',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('PayPal create order error:', error);
        throw new Error('Failed to create PayPal order');
      }

      const data = await response.json();
      return data.id;
    } catch (error: any) {
      console.error('PayPal create order error:', error);
      throw error;
    }
  }

  /**
   * Capture payment
   */
  async captureOrder(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('PayPal capture error:', error);
        throw new Error('Failed to capture PayPal payment');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('PayPal capture error:', error);
      throw error;
    }
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('PayPal get order error:', error);
        throw new Error('Failed to get PayPal order details');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('PayPal get order error:', error);
      throw error;
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(orderId: string): Promise<boolean> {
    try {
      const order = await this.getOrderDetails(orderId);
      return order.status === 'COMPLETED';
    } catch (error) {
      console.error('PayPal verify error:', error);
      return false;
    }
  }

  /**
   * Process webhook data
   */
  processWebhook(data: any): {
    success: boolean;
    userId?: string;
    planId?: string;
    amount?: string;
    currency?: string;
    transactionId?: string;
  } {
    try {
      const eventType = data.event_type;
      const resource = data.resource;

      // Check if payment was completed
      if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        const customId = resource.custom_id ? JSON.parse(resource.custom_id) : {};

        return {
          success: true,
          userId: customId.userId,
          planId: customId.planId,
          amount: resource.amount?.value,
          currency: resource.amount?.currency_code,
          transactionId: resource.id,
        };
      }

      return { success: false };
    } catch (error) {
      console.error('PayPal webhook processing error:', error);
      return { success: false };
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(
    webhookId: string,
    headers: any,
    body: any
  ): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          transmission_id: headers['paypal-transmission-id'],
          transmission_time: headers['paypal-transmission-time'],
          cert_url: headers['paypal-cert-url'],
          auth_algo: headers['paypal-auth-algo'],
          transmission_sig: headers['paypal-transmission-sig'],
          webhook_id: webhookId,
          webhook_event: body,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.verification_status === 'SUCCESS';
    } catch (error) {
      console.error('PayPal webhook verification error:', error);
      return false;
    }
  }
}

// Singleton instance
let paypalServiceInstance: PayPalService | null = null;

export const getPayPalService = (): PayPalService => {
  if (!paypalServiceInstance) {
    paypalServiceInstance = new PayPalService();
  }
  return paypalServiceInstance;
};

export default PayPalService;

