"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AppLogo } from "@/components/app/AppLogo";
import { ProgressBar } from "@/components/app/ProgressBar";
import Step1Upload from "@/components/app/Step1Upload";
import Step2Profile from "@/components/app/Step2Profile";
import Step3JobDetails from "@/components/app/Step3JobDetails";
import Step4Results from "@/components/app/Step4Results";

const steps = [
  "Upload CV",
  "Review Profile",
  "Job Details",
  "Generate Results",
];

const initialFormData = {
  cvFileName: "",
  rawCvText: "",
  structuredCvData: null as any,
  profile: {
    name: "",
    email: "",
    phone: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
  },
  jobDescription: "",
  generateCoverLetter: true,
};

export type FormData = typeof initialFormData;

export default function Home() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useLocalStorage<FormData>(
    "cv-refactor-data",
    initialFormData
  );

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  const goToStep = (stepNumber: number) =>
    setStep(Math.max(1, Math.min(stepNumber, steps.length)));

  const handleReset = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("cv-refactor-data");
      window.location.reload();
    }
  };

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const updateProfileData = (profileData: Partial<FormData["profile"]>) => {
    setFormData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profileData },
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1Upload nextStep={nextStep} updateFormData={updateFormData} />
        );
      case 2:
        return (
          <Step2Profile
            nextStep={nextStep}
            prevStep={prevStep}
            formData={formData}
            updateProfileData={updateProfileData}
            updateFormData={updateFormData}
            resetData={handleReset}
          />
        );
      case 3:
        return (
          <Step3JobDetails
            nextStep={nextStep}
            prevStep={prevStep}
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return <Step4Results prevStep={prevStep} formData={formData} />;
      default:
        return (
          <Step1Upload nextStep={nextStep} updateFormData={updateFormData} />
        );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 sm:py-12 flex flex-col items-center min-h-full">
        <header className="flex items-center gap-4 mb-8">
          <AppLogo className="h-14 w-14" />
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Refactor Pro
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Transform your CV with AI-powered precision
            </p>
          </div>
        </header>

        <div className="w-full max-w-5xl mb-12">
          <ProgressBar steps={steps} currentStep={step} goToStep={goToStep} />
        </div>

        <div className="w-full max-w-5xl flex-grow">{renderStep()}</div>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>© 2024 AI-Refactor Pro • Powered by Advanced AI Technology</p>
        </footer>
      </div>
    </main>
  );
}
