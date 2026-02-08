"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "../types";

interface ProgressBarProps {
  currentStep: number;
  className?: string;
}

export function ProgressBar({ currentStep, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="relative">
        {/* Background track */}
        <div className="h-2 w-full rounded-full bg-muted" />

        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-primary transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%`,
          }}
        />

        {/* Step indicators */}
        <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-between">
          {ONBOARDING_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-medium transition-all",
                index < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : index === currentStep
                    ? "border-primary bg-background text-primary"
                    : "border-muted bg-background text-muted-foreground",
              )}
            >
              {index < currentStep ? (
                <Check className="h-3 w-3" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step labels (hidden on mobile) */}
      <div className="mt-4 hidden justify-between sm:flex">
        {ONBOARDING_STEPS.map((step, index) => (
          <span
            key={step.id}
            className={cn(
              "text-xs",
              index <= currentStep
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            {step.title}
          </span>
        ))}
      </div>
    </div>
  );
}
