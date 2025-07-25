'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { AppLogo } from '@/components/app/AppLogo';
import { ProgressBar } from '@/components/app/ProgressBar';
import Step1Upload from '@/components/app/Step1Upload';
import Step2Profile from '@/components/app/Step2Profile';
import Step3JobDetails from '@/components/app/Step3JobDetails';
import Step4Results from '@/components/app/Step4Results';

const steps = ["Upload CV", "Your Profile", "Job Details", "Generate"];

const initialFormData = {
  cvFileName: '',
  rawCvText: '',
  profile: {
    name: '',
    email: '',
    phone: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
  },
  jobDescription: '',
  generateCoverLetter: true,
};

export type FormData = typeof initialFormData;

export default function Home() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useLocalStorage<FormData>('cv-refactor-data', initialFormData);

  const nextStep = () => setStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  const goToStep = (stepNumber: number) => setStep(Math.max(1, Math.min(stepNumber, steps.length)));

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('cv-refactor-data');
      window.location.reload();
    }
  };

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const updateProfileData = (profileData: Partial<FormData['profile']>) => {
    setFormData(prev => ({ ...prev, profile: { ...prev.profile, ...profileData } }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Upload nextStep={nextStep} updateFormData={updateFormData} />;
      case 2:
        return <Step2Profile nextStep={nextStep} prevStep={prevStep} formData={formData} updateProfileData={updateProfileData} updateFormData={updateFormData} resetData={handleReset} />;
      case 3:
        return <Step3JobDetails nextStep={nextStep} prevStep={prevStep} formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4Results prevStep={prevStep} formData={formData} />;
      default:
        return <Step1Upload nextStep={nextStep} updateFormData={updateFormData} />;
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 sm:py-12 flex flex-col items-center min-h-full">
      <header className="flex items-center gap-4 mb-8">
        <AppLogo className="h-12 w-12" />
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-gray-800 dark:text-gray-100">
          AI-Refactor Pro
        </h1>
      </header>
      
      <div className="w-full max-w-4xl mb-12">
        <ProgressBar steps={steps} currentStep={step} goToStep={goToStep} />
      </div>

      <div className="w-full max-w-4xl flex-grow">
        {renderStep()}
      </div>
    </main>
  );
}
