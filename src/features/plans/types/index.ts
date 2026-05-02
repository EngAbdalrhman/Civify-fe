/**
 * Subscription Plan Types
 * TypeScript interfaces for subscription and payment data
 */

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  cvLimit: number | null;
  watermark: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  allowAnnualBilling?: boolean;
  sortOrder?: number;
  hasApiAccess?: boolean;
  allowTranslation?: boolean;
  allowDocExport?: boolean;
  jobMatchLimit?: number | null;
}

export interface PlanFeature {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  planName: string;
  status: 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  currentCvCount: number;
  isAnnual: boolean;
  createdAt: string;
  // DTO Fields
  cvLimit: number | null;
  usageResetDate?: string;
  currentTokenUsage?: number;
  autoRenew?: boolean;
}

export interface PaymentInitiationResponse {
  paymentKey: string;
  paymentUrl: string;
  orderId: string;
  subscriptionId?: number;
  amount?: string;
  currency?: string;
  message?: string;
}

export interface PaymentTransaction {
  id: number;
  userId: number;
  orderId: string;
  paymentKey: string;
  amount: string;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  gateway: string;
  completedAt?: string;
  createdAt: string;
}

export interface PricingTierDisplay {
  id: string;
  planId: number;
  name: string;
  price: number;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  highlighted?: boolean;
  cta: string;
  ctaLink: string;
}
