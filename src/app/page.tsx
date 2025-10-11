"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/context/auth-context";
import { useDatabase } from "@/hooks/use-database";
import { AppLogo } from "@/components/app/AppLogo";
import { ProgressBar } from "@/components/app/ProgressBar";
import Step1Upload from "@/components/app/Step1Upload";
import Step2Profile from "@/components/app/Step2Profile";
import Step3JobDetails from "@/components/app/Step3JobDetails";
import Step4Results from "@/components/app/Step4Results";
import { Button } from "@/components/ui/button";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const database = useDatabase();
  const hasRedirected = useRef(false);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useLocalStorage<FormData>(
    "cv-refactor-data",
    initialFormData
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isHydrated && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push("/login");
    }
  }, [user, isHydrated, router]);

  // Don't render anything until hydrated
  if (!isHydrated) {
    return null;
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
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
        <header className="flex items-center justify-between w-full mb-8">
          <div className="flex items-center gap-4">
            <AppLogo className="h-14 w-14" />
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Civify
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Transform your CV with AI-powered precision
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </header>

        <div className="w-full max-w-5xl mb-12">
          <ProgressBar steps={steps} currentStep={step} goToStep={goToStep} />
        </div>

        <div className="w-full max-w-5xl flex-grow">{renderStep()}</div>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>© 2025 Civify • Powered by Speedy</p>
        </footer>
      </div>
    </main>
  );
}
