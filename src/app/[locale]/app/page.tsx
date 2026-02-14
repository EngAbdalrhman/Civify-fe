"use client";

import { FLAGS } from "@/config/flags";
import { useOnboarding } from "@/features/onboarding";
import { OnboardingHub } from "@/features/onboarding";
import { PersonalizedDashboard } from "@/features/user-dashboard/components/PersonalizedDashboard";

export default function PersonalPage() {
  const { hasCompletedOnboarding } = useOnboarding();

  if (FLAGS.ENABLE_INLINE_ONBOARDING && !hasCompletedOnboarding) {
    return <OnboardingHub />;
  }

  return <PersonalizedDashboard />;
}
