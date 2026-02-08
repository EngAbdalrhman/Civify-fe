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
  OnboardingGoal,
  ONBOARDING_STORAGE_KEY,
  ONBOARDING_COMPLETED_KEY,
  ONBOARDING_RESUME_DATA_KEY,
  ONBOARDING_STEPS,
} from "../types";

interface OnboardingContextValue extends OnboardingState {
  startOnboarding: () => void;
  setGoal: (goal: OnboardingGoal) => void;
  setTargetJob: (title: string, company?: string, description?: string) => void;
  setTemplate: (templateId: string) => void;
  setHasExistingCv: (value: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  completeOnboarding: (data?: {
    targetJobTitle?: string;
    targetCompany?: string;
    jobDescription?: string;
    selectedTemplate?: string;
  }) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  hasCompletedOnboarding: boolean;
}

const initialState: OnboardingState = {
  isActive: false,
  goal: null,
  currentStep: 0,
  totalSteps: ONBOARDING_STEPS.length,
  hasExistingCv: false,
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

  const startOnboarding = useCallback(() => {
    setState({ ...initialState, isActive: true });
  }, []);

  const setGoal = useCallback((goal: OnboardingGoal) => {
    setState((prev) => ({ ...prev, goal }));
  }, []);

  const setTargetJob = useCallback(
    (title: string, company?: string, description?: string) => {
      setState((prev) => ({
        ...prev,
        targetJobTitle: title,
        targetCompany: company,
        jobDescription: description,
      }));
    },
    [],
  );

  const setTemplate = useCallback((templateId: string) => {
    setState((prev) => ({ ...prev, selectedTemplate: templateId }));
  }, []);

  const setHasExistingCv = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, hasExistingCv: value }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps - 1),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, prev.totalSteps - 1)),
    }));
  }, []);

  const completeOnboarding = useCallback(
    (data?: {
      targetJobTitle?: string;
      targetCompany?: string;
      jobDescription?: string;
      selectedTemplate?: string;
    }) => {
      if (typeof window !== "undefined") {
        // Save onboarding data for resume builder to consume
        // Use passed data if available (to avoid stale closure), otherwise fallback to state
        const resumeData = {
          targetJobTitle: data?.targetJobTitle ?? state.targetJobTitle,
          targetCompany: data?.targetCompany ?? state.targetCompany,
          jobDescription: data?.jobDescription ?? state.jobDescription,
          selectedTemplate: data?.selectedTemplate ?? state.selectedTemplate,
        };
        localStorage.setItem(
          ONBOARDING_RESUME_DATA_KEY,
          JSON.stringify(resumeData),
        );

        localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      }
      setState(initialState);
      setHasCompletedOnboarding(true);
    },
    [
      state.targetJobTitle,
      state.targetCompany,
      state.jobDescription,
      state.selectedTemplate,
    ],
  );

  const skipOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
    setState(initialState);
    setHasCompletedOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
    setState(initialState);
    setHasCompletedOnboarding(false);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        startOnboarding,
        setGoal,
        setTargetJob,
        setTemplate,
        setHasExistingCv,
        nextStep,
        prevStep,
        goToStep,
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
