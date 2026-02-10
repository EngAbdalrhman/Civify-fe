"use client";

import { useOnboarding } from "@/features/onboarding";
import { OnboardingHub } from "@/features/onboarding";
import { PersonalizedDashboard } from "@/features/user-dashboard/components/PersonalizedDashboard";

export default function PersonalPage() {
  const { hasCompletedOnboarding } = useOnboarding();

  if (!hasCompletedOnboarding) {
    return <OnboardingHub />;
  }

  return <PersonalizedDashboard />;
}
