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
  CANCEL: '/v1/subscriptions/cancel',
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
   * Cancel subscription (marks for cancellation at end of billing period)
   */
  async cancelSubscription(): Promise<{ message: string }> {
    const response = await apiClient.post<{ data: { message: string } }>(API_ENDPOINTS.CANCEL);
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
    features: { text: string; included: boolean }[];
    highlighted: boolean;
    cta: string;
    ctaLink: string;
  } {
    const features: { text: string; included: boolean }[] = [];
    const name = plan.name.toLowerCase();

    // CV Limit
    if (plan.cvLimit === null) {
      features.push({ text: 'Unlimited CV generations', included: true });
    } else {
      features.push({ text: `${plan.cvLimit} CV generations per month`, included: true });
    }

    // Job Match Limit
    if (plan.jobMatchLimit === null) {
      features.push({ text: 'Unlimited job matches', included: true });
    } else if (plan.jobMatchLimit > 0) {
      features.push({ text: `${plan.jobMatchLimit} job matches per month`, included: true });
    } else {
      features.push({ text: 'AI job matching', included: false });
    }

    // Standard features
    features.push({ text: 'AI-powered CV tailoring', included: true });
    features.push({ text: 'Personal information masking', included: true });
    features.push({ text: 'PDF export', included: true });

    // Watermark
    if (!plan.watermark) {
      features.push({ text: 'No watermark', included: true });
    }

    // Translation Feature
    if (plan.allowTranslation) {
      features.push({ text: 'Multilingual AI translation', included: true });
    } else {
      features.push({ text: 'Multilingual AI translation', included: false });
    }

    // API Access
    if (plan.hasApiAccess) {
      features.push({ text: 'Developer API access', included: true });
    } else {
      features.push({ text: 'Developer API access', included: false });
    }

    // All plans get basic support
    features.push({ text: 'Basic support', included: true });

    const price = isAnnual ? parseFloat(plan.annualPrice) : parseFloat(plan.monthlyPrice);
    const isPopular = name.includes('premium') || name.includes('pro') || name.includes('beta');
    
    const isFreePlan = name === 'free';
    
    // Capitalize first letter of each word for display
    const displayName = plan.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return {
      id: name.replace(/\s+/g, '-').toLowerCase(),
      planId: plan.id,
      name: displayName,
      price,
      period: isAnnual ? 'year' : 'month',
      description: plan.description,
      features,
      highlighted: isPopular,
      cta: isFreePlan ? 'Get Started' : 'Select Plan',
      ctaLink: isFreePlan ? '/signup' : `/checkout?planId=${plan.id}`,
    };
  }
}

export const subscriptionService = new SubscriptionService();
export { SubscriptionService };
