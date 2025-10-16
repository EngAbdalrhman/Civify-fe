/**
 * Paymob Payment Service
 *
 * IMPORTANT: This service is READY but DISABLED by default.
 * To enable:
 * 1. Create Paymob merchant account at https://paymob.com
 * 2. Get API credentials from dashboard
 * 3. Add environment variables to .env.local
 * 4. Set NEXT_PUBLIC_PAYMOB_ENABLED=true
 */

import axios from "axios";

const PAYMOB_API_URL = "https://accept.paymob.com/api";

// Check if Paymob is enabled
export const isPaymobEnabled = () => {
  return process.env.NEXT_PUBLIC_PAYMOB_ENABLED === "true";
};

export interface PaymobPaymentData {
  amount: number; // in cents (e.g., 999 for $9.99)
  currency: string; // 'EGP' or 'USD'
  userEmail: string;
  userName: string;
  userId: string;
  planId: string;
  planName: string;
}

export interface PaymobConfig {
  apiKey: string;
  cardIntegrationId: string;
  walletIntegrationId?: string;
  iframeId: string;
  hmacSecret: string;
}

export class PaymobService {
  private config: PaymobConfig;

  constructor(config?: PaymobConfig) {
    // Use provided config or load from environment
    this.config = config || {
      apiKey: process.env.PAYMOB_API_KEY || "",
      cardIntegrationId: process.env.PAYMOB_CARD_INTEGRATION_ID || "",
      walletIntegrationId: process.env.PAYMOB_WALLET_INTEGRATION_ID,
      iframeId: process.env.PAYMOB_IFRAME_ID || "",
      hmacSecret: process.env.PAYMOB_HMAC_SECRET || "",
    };
  }

  /**
   * Check if Paymob is properly configured
   */
  isConfigured(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.cardIntegrationId &&
      this.config.iframeId &&
      this.config.hmacSecret
    );
  }

  /**
   * Step 1: Get authentication token
   */
  async getAuthToken(): Promise<string> {
    try {
      const response = await axios.post(`${PAYMOB_API_URL}/auth/tokens`, {
        api_key: this.config.apiKey,
      });
      return response.data.token;
    } catch (error: any) {
      console.error(
        "Paymob auth error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to authenticate with Paymob");
    }
  }

  /**
   * Step 2: Create order
   */
  async createOrder(
    authToken: string,
    amount: number,
    currency: string = "EGP"
  ): Promise<number> {
    try {
      const response = await axios.post(`${PAYMOB_API_URL}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: "false",
        amount_cents: amount,
        currency: currency,
        items: [],
      });
      return response.data.id;
    } catch (error: any) {
      console.error(
        "Paymob order error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to create Paymob order");
    }
  }

  /**
   * Step 3: Get payment key
   */
  async getPaymentKey(
    authToken: string,
    orderId: number,
    paymentData: PaymobPaymentData
  ): Promise<string> {
    try {
      const nameParts = paymentData.userName.split(" ");
      const firstName = nameParts[0] || "User";
      const lastName = nameParts.slice(1).join(" ") || "Name";

      const response = await axios.post(
        `${PAYMOB_API_URL}/acceptance/payment_keys`,
        {
          auth_token: authToken,
          amount_cents: paymentData.amount,
          expiration: 3600, // 1 hour
          order_id: orderId,
          billing_data: {
            email: paymentData.userEmail,
            first_name: firstName,
            last_name: lastName,
            phone_number: "+201000000000", // Default - can be collected from user
            country: "EG",
            city: "Cairo",
            street: "N/A",
            building: "N/A",
            floor: "N/A",
            apartment: "N/A",
          },
          currency: paymentData.currency,
          integration_id: this.config.cardIntegrationId,
          // Store metadata for webhook processing
          metadata: {
            userId: paymentData.userId,
            planId: paymentData.planId,
            planName: paymentData.planName,
          },
        }
      );
      return response.data.token;
    } catch (error: any) {
      console.error(
        "Paymob payment key error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to get Paymob payment key");
    }
  }

  /**
   * Complete flow: Create payment URL
   */
  async createPaymentUrl(paymentData: PaymobPaymentData): Promise<string> {
    try {
      if (!this.isConfigured()) {
        throw new Error("Paymob is not properly configured");
      }

      // Step 1: Get auth token
      const authToken = await this.getAuthToken();

      // Step 2: Create order
      const orderId = await this.createOrder(
        authToken,
        paymentData.amount,
        paymentData.currency
      );

      // Step 3: Get payment key
      const paymentKey = await this.getPaymentKey(
        authToken,
        orderId,
        paymentData
      );

      // Step 4: Return iframe URL
      return `https://accept.paymob.com/api/acceptance/iframes/${this.config.iframeId}?payment_token=${paymentKey}`;
    } catch (error: any) {
      console.error("Paymob payment error:", error);
      throw error;
    }
  }

  /**
   * Verify webhook signature (HMAC) Callback
   */
  verifyWebhook(data: any, receivedHmac: string): boolean {
    try {
      const crypto = require("crypto");

      // Concatenate specific fields as per Paymob documentation
      const concatenatedString =
        data.amount_cents +
        data.created_at +
        data.currency +
        data.error_occured +
        data.has_parent_transaction +
        data.id +
        data.integration_id +
        data.is_3d_secure +
        data.is_auth +
        data.is_capture +
        data.is_refunded +
        data.is_standalone_payment +
        data.is_voided +
        data.order +
        data.owner +
        data.pending +
        data.source_data_pan +
        data.source_data_sub_type +
        data.source_data_type +
        data.success;

      const calculatedHmac = crypto
        .createHmac("sha512", this.config.hmacSecret)
        .update(concatenatedString)
        .digest("hex");

      return calculatedHmac === receivedHmac;
    } catch (error) {
      console.error("Paymob webhook verification error:", error);
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
    amount?: number;
    currency?: string;
    transactionId?: string;
  } {
    try {
      const obj = data.obj || data;

      return {
        success: obj.success === "true" || obj.success === true,
        userId:
          obj.order?.shipping_data?.extra_description || obj.metadata?.userId,
        planId: obj.metadata?.planId,
        amount: obj.amount_cents,
        currency: obj.currency,
        transactionId: obj.id?.toString(),
      };
    } catch (error) {
      console.error("Paymob webhook processing error:", error);
      return { success: false };
    }
  }
}

// Singleton instance
let paymobServiceInstance: PaymobService | null = null;

export const getPaymobService = (): PaymobService => {
  if (!paymobServiceInstance) {
    paymobServiceInstance = new PaymobService();
  }
  return paymobServiceInstance;
};

export default PaymobService;
