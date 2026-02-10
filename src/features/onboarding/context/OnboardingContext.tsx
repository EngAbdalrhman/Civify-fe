"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  OnboardingState,
  PrimaryIntent,
  UserOnboardingProfile,
  ONBOARDING_STORAGE_KEY,
  ONBOARDING_COMPLETED_KEY,
  ONBOARDING_PROFILE_KEY,
} from "../types";
import { trackOnboardingEvent } from "../utils/trackOnboardingEvent";

interface OnboardingContextValue extends OnboardingState {
  setPrimaryIntent: (intent: PrimaryIntent) => void;
  setProfile: (updates: Partial<UserOnboardingProfile>) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  hasCompletedOnboarding: boolean;
}

const initialState: OnboardingState = {
  isActive: false,
  onboardingCompleted: false,
  primaryIntent: null,
  profile: {},
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (completed === "true") {
      const profileData = localStorage.getItem(ONBOARDING_PROFILE_KEY);
      let profile: UserOnboardingProfile = {};
      if (profileData) {
        try {
          profile = JSON.parse(profileData);
        } catch {
          // ignore
        }
      }
      setState((prev) => ({
        ...prev,
        onboardingCompleted: true,
        primaryIntent: profile.primaryIntent || null,
        profile,
      }));
      setHasCompletedOnboarding(true);
      return;
    }

    const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (e) {
        console.error("Failed to parse onboarding state:", e);
      }
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (state.isActive) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const setPrimaryIntent = useCallback((intent: PrimaryIntent) => {
    setState((prev) => {
      const newProfile = { ...prev.profile, primaryIntent: intent };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          ONBOARDING_PROFILE_KEY,
          JSON.stringify(newProfile),
        );
      }
      return { ...prev, primaryIntent: intent, profile: newProfile };
    });
    trackOnboardingEvent("primary_intent_selected", { primaryIntent: intent });
  }, []);

  const setProfile = useCallback((updates: Partial<UserOnboardingProfile>) => {
    setState((prev) => {
      const newProfile = { ...prev.profile, ...updates };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          ONBOARDING_PROFILE_KEY,
          JSON.stringify(newProfile),
        );
      }
      return { ...prev, profile: newProfile };
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }

    trackOnboardingEvent("onboarding_completed", {
      primaryIntent: state.primaryIntent || undefined,
      industry: state.profile.industry,
    });

    setState((prev) => ({
      ...initialState,
      onboardingCompleted: true,
      primaryIntent: prev.primaryIntent,
      profile: prev.profile,
    }));
    setHasCompletedOnboarding(true);
  }, [state.primaryIntent, state.profile]);

  const skipOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
    setState((prev) => ({
      ...initialState,
      onboardingCompleted: true,
      primaryIntent: prev.primaryIntent,
      profile: prev.profile,
    }));
    setHasCompletedOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      localStorage.removeItem(ONBOARDING_PROFILE_KEY);
    }
    setState(initialState);
    setHasCompletedOnboarding(false);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        setPrimaryIntent,
        setProfile,
        completeOnboarding,
        skipOnboarding,
        resetOnboarding,
        hasCompletedOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
