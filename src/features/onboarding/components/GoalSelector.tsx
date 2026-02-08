"use client";

import { FileText, Sparkles, Upload, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { OnboardingGoal } from "../types";

interface GoalSelectorProps {
  selectedGoal: OnboardingGoal | null;
  onSelect: (goal: OnboardingGoal) => void;
}

const goals = [
  {
    id: "create_new" as OnboardingGoal,
    icon: PenTool,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "improve_existing" as OnboardingGoal,
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-600",
  },
];

export function GoalSelector({ selectedGoal, onSelect }: GoalSelectorProps) {
  const t = useTranslations("onboarding.goals");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {goals.map((goal) => {
        const Icon = goal.icon;
        const isSelected = selectedGoal === goal.id;

        return (
          <button
            key={goal.id}
            onClick={() => onSelect(goal.id)}
            className={cn(
              "group relative flex flex-col items-center gap-4 rounded-xl border-2 p-6 text-center transition-all",
              isSelected
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border hover:border-primary/50 hover:bg-muted/50",
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br transition-transform group-hover:scale-110",
                goal.gradient,
              )}
            >
              <Icon className="h-8 w-8 text-white" />
            </div>

            {/* Content */}
            <div>
              <h3 className="font-semibold">{t(`${goal.id}.title`)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`${goal.id}.description`)}
              </p>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <svg
                  className="h-4 w-4 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
