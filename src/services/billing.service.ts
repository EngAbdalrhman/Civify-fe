/**
 * Billing Service
 * Handles invoice and billing history API calls
 */

import apiClient from '@/api/client';

export interface Invoice {
  id: number;
  uuid: string;
  planName: string;
  originalAmount: number;
  discountAmount: number | null;
  finalAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  billingType: 'INITIAL' | 'RENEWAL';
  description: string;
  gateway: string | null;
  paymentUrl: string | null;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface InvoicePaymentResponse {
  uuid: string;
  paymentUrl: string;
  gateway: string;
}

const API_ENDPOINTS = {
  INVOICES: '/v1/billing/invoices',
  INVOICE_BY_UUID: (uuid: string) => `/v1/billing/invoices/${uuid}`,
  PAY_INVOICE: (uuid: string) => `/v1/billing/invoices/${uuid}/pay`,
};

class BillingService {
  /**
   * Get user's invoice history
   */
  async getInvoices(): Promise<Invoice[]> {
    const response = await apiClient.get<Invoice[]>(API_ENDPOINTS.INVOICES);
    return response.data;
  }

  /**
   * Get invoice by UUID (for checkout page)
   */
  async getInvoiceByUuid(uuid: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(API_ENDPOINTS.INVOICE_BY_UUID(uuid));
    return response.data;
  }

  /**
   * Generate payment link for an invoice
   */
  async payInvoice(uuid: string, gateway: string, method?: string): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(
      `${API_ENDPOINTS.PAY_INVOICE(uuid)}?gateway=${gateway}&method=${method || 'CARD'}`
    );
    return response.data;
  }
}

export const billingService = new BillingService();
export { BillingService };
