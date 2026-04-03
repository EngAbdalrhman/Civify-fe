"use client";

import { FLAGS } from "@/config/flags";
import { useOnboarding } from "@/features/onboarding";
import { OnboardingHub } from "@/features/onboarding";
import { PersonalizedDashboard } from "@/features/user-dashboard/components/PersonalizedDashboard";
import { useTourAutoStart, getDashboardTourSteps } from "@/features/onboarding";
import { useTranslations } from "next-intl";

export default function PersonalPage() {
  const { hasCompletedOnboarding } = useOnboarding();
  const tTour = useTranslations("tour");

  const showOnboarding = FLAGS.ENABLE_INLINE_ONBOARDING && !hasCompletedOnboarding;
  useTourAutoStart("dashboard", getDashboardTourSteps(tTour), { enabled: !showOnboarding });

  if (showOnboarding) {
    return <OnboardingHub />;
  }

  return <PersonalizedDashboard />;
}
