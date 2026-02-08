// Onboarding Types

export type OnboardingGoal = "create_new" | "improve_existing";

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  isComplete: boolean;
  isOptional?: boolean;
}

export interface OnboardingState {
  isActive: boolean;
  goal: OnboardingGoal | null;
  currentStep: number;
  totalSteps: number;
  targetJobTitle?: string;
  targetCompany?: string;
  jobDescription?: string;
  selectedTemplate?: string;
  hasExistingCv: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "goal",
    title: "Choose Your Goal",
    description: "What would you like to do today?",
    isComplete: false,
  },
  {
    id: "job-target",
    title: "Target Job",
    description: "Tell us about the job you're applying for",
    isComplete: false,
  },
  {
    id: "template",
    title: "Choose Template",
    description: "Select a template that fits your style",
    isComplete: false,
  },
  {
    id: "import",
    title: "Import CV",
    description: "Upload your existing CV or start fresh",
    isComplete: false,
    isOptional: true,
  },
  {
    id: "finish",
    title: "Start Building",
    description: "Review and begin creating your CV",
    isComplete: false,
  },
];

export const ONBOARDING_STORAGE_KEY = "civify_onboarding_state";
export const ONBOARDING_COMPLETED_KEY = "civify_onboarding_completed";
export const ONBOARDING_RESUME_DATA_KEY = "civify_onboarding_resume_data";
