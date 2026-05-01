/**
 * usePlans Hook
 * Fetches subscription plans from backend with loading and error states
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('landing.pricing');

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [displayPlans, setDisplayPlans] = useState<PricingTierDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(initialIsAnnual);

  // Transform plan to display format with translations
  const transformPlanToDisplay = useCallback((plan: SubscriptionPlan, annual: boolean): PricingTierDisplay => {
    const features: { text: string; included: boolean }[] = [];
    const name = plan.name.toLowerCase();

    // CV Limit
    if (plan.cvLimit === null) {
      features.push({ text: t('features.cvStorageUnlimited'), included: true });
    } else {
      features.push({ text: t('features.cvStorage', { count: plan.cvLimit }), included: true });
    }

    // Job Match Limit
    if (plan.jobMatchLimit === null) {
      features.push({ text: t('features.jobMatchUnlimited'), included: true });
    } else if ((plan.jobMatchLimit ?? 0) > 0) {
      features.push({ text: t('features.jobMatch', { count: plan.jobMatchLimit }), included: true });
    } else {
      features.push({ text: t('features.jobMatch', { count: 0 }), included: false });
    }

    // Standard features
    features.push({ text: t('features.aiTailoring'), included: true });
    features.push({ text: t('features.masking'), included: true });
    features.push({ text: t('features.pdfExport'), included: true });

    // Watermark
    if (!plan.watermark) {
      features.push({ text: t('features.noWatermark'), included: true });
    }

    // API Access
    if (plan.hasApiAccess) {
      features.push({ text: t('features.apiAccess'), included: true });
    } else {
      features.push({ text: t('features.apiAccess'), included: false });
    }

    // Translation
    if (plan.allowTranslation) {
      features.push({ text: t('features.translation'), included: true });
    } else {
      features.push({ text: t('features.translation'), included: false });
    }

    // All plans get basic support
    features.push({ text: t('features.basicSupport'), included: true });

    const price = annual ? parseFloat(plan.annualPrice) : parseFloat(plan.monthlyPrice);
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
      period: annual ? t('yearly').toLowerCase() : t('monthly').toLowerCase(),
      description: plan.description,
      features,
      highlighted: isPopular,
      cta: isFreePlan ? t('getStarted') : t('selectPlan'),
      ctaLink: isFreePlan ? '/signup' : `/checkout?planId=${plan.id}`,
    };
  }, [t]);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedPlans = await subscriptionService.getAllPlans();
      setPlans(fetchedPlans);

      // Transform and sort plans
      const transformed = fetchedPlans
        .filter(plan => !isAnnual || plan.allowAnnualBilling !== false)
        .map(plan => transformPlanToDisplay(plan, isAnnual));

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
  }, [isAnnual, transformPlanToDisplay]);

  // Re-transform when isAnnual changes
  useEffect(() => {
    if (plans.length > 0) {
      const transformed = plans
        .filter(plan => !isAnnual || plan.allowAnnualBilling !== false)
        .map(plan => transformPlanToDisplay(plan, isAnnual));

      // Sort by backend sortOrder field
      const sorted = transformed.sort((a, b) => {
        const aPlan = plans.find(p => p.id === a.planId);
        const bPlan = plans.find(p => p.id === b.planId);
        return (aPlan?.sortOrder ?? 999) - (bPlan?.sortOrder ?? 999);
      });

      setDisplayPlans(sorted);
    }
  }, [isAnnual, plans, transformPlanToDisplay]);

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

