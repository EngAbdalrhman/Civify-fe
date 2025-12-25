/**
 * Subscription Service
 * Handles all subscription-related API calls
 */

import apiClient from '@/api/client';
import type { SubscriptionPlan, UserSubscription } from '@/features/plans/types';

const API_ENDPOINTS = {
  PLANS: '/v1/subscriptions/plans',
  PLAN_BY_ID: (id: number) => `/v1/subscriptions/plans/${id}`,
  MY_SUBSCRIPTION: '/v1/subscriptions/my-subscription',
  MY_SUBSCRIPTIONS: '/v1/subscriptions/my-subscriptions',
  CANCEL: (id: number) => `/v1/subscriptions/cancel/${id}`,
  RENEW: (id: number) => `/v1/subscriptions/renew/${id}`,
};

class SubscriptionService {
  /**
   * Get all active subscription plans (public endpoint)
   */
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<{ data: SubscriptionPlan[] }>(API_ENDPOINTS.PLANS);
    return response.data.data;
  }

  /**
   * Get subscription plan by ID
   */
  async getPlanById(planId: number): Promise<SubscriptionPlan> {
    const response = await apiClient.get<{ data: SubscriptionPlan }>(API_ENDPOINTS.PLAN_BY_ID(planId));
    return response.data.data;
  }

  /**
   * Get current user's active subscription
   */
  async getMyActiveSubscription(): Promise<UserSubscription | null> {
    try {
      const response = await apiClient.get<{ data: UserSubscription }>(API_ENDPOINTS.MY_SUBSCRIPTION);
      return response.data.data;
    } catch (error: unknown) {
      // Return null if no active subscription found (404)
      const err = error as { status?: number };
      if (err.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get current user's subscription history
   */
  async getMySubscriptions(): Promise<UserSubscription[]> {
    const response = await apiClient.get<{ data: UserSubscription[] }>(API_ENDPOINTS.MY_SUBSCRIPTIONS);
    return response.data.data;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: number): Promise<{ message: string }> {
    const response = await apiClient.post<{ data: { message: string } }>(API_ENDPOINTS.CANCEL(subscriptionId));
    return response.data.data;
  }

  /**
   * Renew a subscription
   */
  async renewSubscription(subscriptionId: number, isAnnual: boolean = false): Promise<{ message: string }> {
    const response = await apiClient.post<{ data: { message: string } }>(
      API_ENDPOINTS.RENEW(subscriptionId),
      null,
      { params: { isAnnual } }
    );
    return response.data.data;
  }

  /**
   * Transform backend plan to display format
   */
  transformPlanToDisplay(plan: SubscriptionPlan, isAnnual: boolean = false): {
    id: string;
    planId: number;
    name: string;
    price: number;
    period: string;
    description: string;
    features: string[];
    highlighted: boolean;
    cta: string;
    ctaLink: string;
  } {
    const features: string[] = [];
    const name = plan.name.toLowerCase();

    // CV Limit
    if (plan.cvLimit === null) {
      features.push('Unlimited CV generations');
    } else {
      features.push(`${plan.cvLimit} CV generations per month`);
    }

    // API Access
    if (plan.apiLimit !== null && plan.apiLimit > 0) {
      features.push('Full API access');
      features.push(`${plan.apiLimit} API calls per month`);
    }

    // Standard features
    features.push('AI-powered CV tailoring');
    features.push('Personal information masking');
    features.push('PDF export');

    // Watermark
    if (!plan.watermark) {
      features.push('No watermark');
    }

    // Dashboard access
    if (plan.dashboard) {
      features.push('Dashboard access');
      features.push('Priority support');
      features.push('Advanced AI features');
    } else {
      features.push('Basic support');
    }

    const price = isAnnual ? parseFloat(plan.annualPrice) : parseFloat(plan.monthlyPrice);
    const isPopular = name.includes('premium') || name.includes('pro');

    return {
      id: name.replace(/\s+/g, '-').toLowerCase(),
      planId: plan.id,
      name: plan.name,
      price,
      period: isAnnual ? 'year' : 'month',
      description: plan.description,
      features,
      highlighted: isPopular,
      cta: price === 0 ? 'Get Started' : (isPopular ? 'Start Free Trial' : 'Select Plan'),
      ctaLink: price === 0 ? '/signup' : `/checkout?planId=${plan.id}`,
    };
  }
}

export const subscriptionService = new SubscriptionService();
export { SubscriptionService };
