"use client";

import { useState, useEffect } from "react";
import { Sparkles, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useOnboarding } from "../context/OnboardingContext";

interface WelcomeModalProps {
  isNewUser?: boolean;
}

export function WelcomeModal({ isNewUser = true }: WelcomeModalProps) {
  const t = useTranslations("onboarding.welcome");
  const { isActive, hasCompletedOnboarding, startOnboarding, skipOnboarding } =
    useOnboarding();
  const [isOpen, setIsOpen] = useState(false);

  // Show modal for new users who haven't completed onboarding
  useEffect(() => {
    if (isNewUser && !hasCompletedOnboarding && !isActive) {
      // Small delay to prevent flash
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isNewUser, hasCompletedOnboarding, isActive]);

  const handleStart = () => {
    setIsOpen(false);
    startOnboarding();
  };

  const handleSkip = () => {
    setIsOpen(false);
    skipOnboarding();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600">
            <Rocket className="h-8 w-8 text-white" />
          </div>

          <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
          <DialogDescription className="text-base">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        {/* Benefits */}
        <div className="my-4 space-y-3">
          {["benefit1", "benefit2", "benefit3"].map((key) => (
            <div key={key} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm">{t(key)}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={handleStart} size="lg" className="w-full">
            {t("startButton")}
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            {t("skipButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
