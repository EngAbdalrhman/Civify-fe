// Onboarding Types

export type PrimaryIntent = "build" | "tailor" | "api";

export interface UserOnboardingProfile {
  primaryIntent?: PrimaryIntent;
  targetRole?: string;
  industry?: string;
  experienceLevel?: string;
  goal?: string;
  apiUseCase?: string;
}

export interface OnboardingState {
  isActive: boolean;
  onboardingCompleted: boolean;
  primaryIntent: PrimaryIntent | null;
  profile: UserOnboardingProfile;
}

export const ONBOARDING_STORAGE_KEY = "civify_onboarding_state";
export const ONBOARDING_COMPLETED_KEY = "civify_onboarding_completed";
export const ONBOARDING_PROFILE_KEY = "civify_onboarding_profile";
