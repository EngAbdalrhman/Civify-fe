"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useOnboarding } from "../context/OnboardingContext";
import { ProgressBar } from "./ProgressBar";
import { GoalSelector } from "./GoalSelector";
import { JobTargetStep, TemplateStep, ImportCvStep, FinishStep } from "./steps";

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const {
    isActive,
    currentStep,
    goal,
    targetJobTitle,
    targetCompany,
    jobDescription,
    selectedTemplate,
    hasExistingCv,
    setGoal,
    setTargetJob,
    setTemplate,
    setHasExistingCv,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboarding();

  // Local state for form fields
  const [localJobTitle, setLocalJobTitle] = useState(targetJobTitle || "");
  const [localCompany, setLocalCompany] = useState(targetCompany || "");
  const [localJobDescription, setLocalJobDescription] = useState(
    jobDescription || "",
  );
  const [localTemplate, setLocalTemplate] = useState(
    selectedTemplate || "modern",
  );
  const [localHasExistingCv, setLocalHasExistingCv] = useState(hasExistingCv);

  if (!isActive) return null;

  const handleNext = () => {
    // Save current step data
    switch (currentStep) {
      case 0:
        // Goal step - just proceed
        break;
      case 1:
        setTargetJob(localJobTitle, localCompany, localJobDescription);
        break;
      case 2:
        setTemplate(localTemplate);
        break;
      case 3:
        setHasExistingCv(localHasExistingCv);
        break;
      case 4:
        // Finish step - complete onboarding and navigate
        // Pass local state directly to avoid stale closure issues
        completeOnboarding({
          targetJobTitle: localJobTitle,
          targetCompany: localCompany,
          jobDescription: localJobDescription,
          selectedTemplate: localTemplate,
        });
        router.push("/app/resume-builder");
        return;
    }
    nextStep();
  };

  const handleBack = () => {
    prevStep();
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return goal !== null;
      case 1:
        return localJobTitle.trim().length > 0;
      case 2:
        return localTemplate !== "";
      case 3:
        return true; // Optional step
      case 4:
        return true;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <GoalSelector selectedGoal={goal} onSelect={setGoal} />;
      case 1:
        return (
          <JobTargetStep
            jobTitle={localJobTitle}
            company={localCompany}
            jobDescription={localJobDescription}
            onJobTitleChange={setLocalJobTitle}
            onCompanyChange={setLocalCompany}
            onJobDescriptionChange={setLocalJobDescription}
          />
        );
      case 2:
        return (
          <TemplateStep
            selectedTemplate={localTemplate}
            onSelect={setLocalTemplate}
          />
        );
      case 3:
        return (
          <ImportCvStep
            hasExistingCv={localHasExistingCv}
            onHasExistingCvChange={setLocalHasExistingCv}
          />
        );
      case 4:
        return (
          <FinishStep
            jobTitle={localJobTitle}
            company={localCompany}
            template={localTemplate}
            hasExistingCv={localHasExistingCv}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-2xl shadow-xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-lg font-semibold">{t("wizard.title")}</h1>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <ProgressBar currentStep={currentStep} className="mb-8" />

          {/* Step Content */}
          <div className="min-h-[300px]">{renderStep()}</div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("wizard.back")}
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < 4 && (
                <Button variant="ghost" onClick={handleSkip}>
                  {t("wizard.skip")}
                </Button>
              )}
              <Button onClick={handleNext} disabled={!canProceed()}>
                {currentStep === 4 ? t("wizard.finish") : t("wizard.next")}
                {currentStep < 4 && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
