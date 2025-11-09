/**
 * Subscription Service
 * Handles all subscription-related API calls
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionResponse,
  PriceCalculationResponse,
} from '../types';

/**
 * Subscription Service Class
 */
class SubscriptionService {
  /**
   * Get all active subscription plans
   */
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return await apiClient.get<SubscriptionPlan[]>(
      API_ENDPOINTS.SUBSCRIPTIONS.PLANS
    );
  }

  /**
   * Get subscription plan by ID
   */
  async getPlanById(planId: number): Promise<SubscriptionPlan> {
    return await apiClient.get<SubscriptionPlan>(
      API_ENDPOINTS.SUBSCRIPTIONS.PLAN_BY_ID(planId)
    );
  }

  /**
   * Get current user's active subscription
   */
  async getMyActiveSubscription(): Promise<UserSubscription | null> {
    try {
      return await apiClient.get<UserSubscription>(
        API_ENDPOINTS.SUBSCRIPTIONS.MY_SUBSCRIPTION
      );
    } catch (error: any) {
      // Return null if no active subscription found (404)
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get current user's subscription history
   */
  async getMySubscriptions(): Promise<UserSubscription[]> {
    return await apiClient.get<UserSubscription[]>(
      API_ENDPOINTS.SUBSCRIPTIONS.MY_SUBSCRIPTIONS
    );
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: number): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>(
      API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(subscriptionId)
    );
  }

  /**
   * Renew a subscription
   */
  async renewSubscription(
    subscriptionId: number,
    isAnnual: boolean = false
  ): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>(
      API_ENDPOINTS.SUBSCRIPTIONS.RENEW(subscriptionId),
      null,
      {
        params: { isAnnual },
      }
    );
  }

  /**
   * Check if user has an active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    const subscription = await this.getMyActiveSubscription();
    return subscription !== null && subscription.status === 'ACTIVE';
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(): Promise<'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED' | 'NONE'> {
    const subscription = await this.getMyActiveSubscription();
    return subscription?.status || 'NONE';
  }

  /**
   * Check if user can use a specific feature based on subscription
   */
  async canUseFeature(feature: 'cv' | 'api'): Promise<boolean> {
    const subscription = await this.getMyActiveSubscription();

    if (!subscription || subscription.status !== 'ACTIVE') {
      return false;
    }

    if (feature === 'cv') {
      // Check CV limit
      const cvLimit = subscription.currentCvCount;
      const maxCvLimit = await this.getPlanById(subscription.planId).then(
        (plan) => plan.cvLimit
      );
      return maxCvLimit === null || cvLimit < maxCvLimit;
    }

    if (feature === 'api') {
      // Check API limit
      const apiCount = subscription.currentApiCount;
      const maxApiLimit = await this.getPlanById(subscription.planId).then(
        (plan) => plan.apiLimit
      );
      return maxApiLimit === null || apiCount < maxApiLimit;
    }

    return false;
  }

  /**
   * Get remaining CV generations
   */
  async getRemainingCvGenerations(): Promise<number | null> {
    const subscription = await this.getMyActiveSubscription();

    if (!subscription || subscription.status !== 'ACTIVE') {
      return 0;
    }

    const plan = await this.getPlanById(subscription.planId);

    if (plan.cvLimit === null) {
      return null; // Unlimited
    }

    return Math.max(0, plan.cvLimit - subscription.currentCvCount);
  }

  /**
   * Get remaining API calls
   */
  async getRemainingApiCalls(): Promise<number | null> {
    const subscription = await this.getMyActiveSubscription();

    if (!subscription || subscription.status !== 'ACTIVE') {
      return 0;
    }

    const plan = await this.getPlanById(subscription.planId);

    if (plan.apiLimit === null) {
      return null; // Unlimited
    }

    return Math.max(0, plan.apiLimit - subscription.currentApiCount);
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

// Export class for testing
export { SubscriptionService };

