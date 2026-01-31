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
      const transformed = fetchedPlans
        .filter(plan => !isAnnual || plan.allowAnnualBilling !== false)
        .map(plan => 
          subscriptionService.transformPlanToDisplay(plan, isAnnual)
        );

      // Sort by backend sortOrder field
      const sorted = transformed.sort((a, b) => {
        const aPlan = fetchedPlans.find(p => p.id === a.planId);
        const bPlan = fetchedPlans.find(p => p.id === b.planId);
        return (aPlan?.sortOrder ?? 999) - (bPlan?.sortOrder ?? 999);
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
      const transformed = plans
        .filter(plan => !isAnnual || plan.allowAnnualBilling !== false)
        .map(plan => 
          subscriptionService.transformPlanToDisplay(plan, isAnnual)
        );

      // Sort by backend sortOrder field
      const sorted = transformed.sort((a, b) => {
        const aPlan = plans.find(p => p.id === a.planId);
        const bPlan = plans.find(p => p.id === b.planId);
        return (aPlan?.sortOrder ?? 999) - (bPlan?.sortOrder ?? 999);
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
