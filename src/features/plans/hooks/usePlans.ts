/**
 * usePlans Hook
 * Fetches subscription plans from backend with loading and error states
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '@/services/subscription.service';
import type { SubscriptionPlan, PricingTierDisplay } from '../types';

interface UsePlansOptions {
  isAnnual?: boolean;
  autoFetch?: boolean;
}

interface UsePlansReturn {
  plans: SubscriptionPlan[];
  displayPlans: PricingTierDisplay[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setIsAnnual: (isAnnual: boolean) => void;
  isAnnual: boolean;
}

export function usePlans(options: UsePlansOptions = {}): UsePlansReturn {
  const { isAnnual: initialIsAnnual = false, autoFetch = true } = options;

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [displayPlans, setDisplayPlans] = useState<PricingTierDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(initialIsAnnual);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedPlans = await subscriptionService.getAllPlans();
      setPlans(fetchedPlans);

      // Transform and sort plans
      const transformed = fetchedPlans.map(plan => 
        subscriptionService.transformPlanToDisplay(plan, isAnnual)
      );

      // Sort: Free -> Pro/Premium -> Enterprise -> Lifetime
      const sorted = transformed.sort((a, b) => {
        const order = ['free', 'pro', 'premium', 'enterprise', 'lifetime'];
        const aIndex = order.findIndex(o => a.name.toLowerCase().includes(o));
        const bIndex = order.findIndex(o => b.name.toLowerCase().includes(o));
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      });

      setDisplayPlans(sorted);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
    } finally {
      setIsLoading(false);
    }
  }, [isAnnual]);

  // Re-transform when isAnnual changes
  useEffect(() => {
    if (plans.length > 0) {
      const transformed = plans.map(plan => 
        subscriptionService.transformPlanToDisplay(plan, isAnnual)
      );

      const sorted = transformed.sort((a, b) => {
        const order = ['free', 'pro', 'premium', 'enterprise', 'lifetime'];
        const aIndex = order.findIndex(o => a.name.toLowerCase().includes(o));
        const bIndex = order.findIndex(o => b.name.toLowerCase().includes(o));
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      });

      setDisplayPlans(sorted);
    }
  }, [isAnnual, plans]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchPlans();
    }
  }, [autoFetch, fetchPlans]);

  return {
    plans,
    displayPlans,
    isLoading,
    error,
    refetch: fetchPlans,
    setIsAnnual,
    isAnnual,
  };
}

export default usePlans;
