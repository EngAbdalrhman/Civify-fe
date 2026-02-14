"use client";

import { PenTool, Sparkles, Code2, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useOnboarding } from "../context/OnboardingContext";
import { PrimaryIntent } from "../types";

const intents: {
  id: PrimaryIntent;
  icon: typeof PenTool;
  color: string;
  iconBg: string;
  borderHover: string;
  route: string;
}[] = [
  {
    id: "build",
    icon: PenTool,
    color: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    borderHover: "hover:border-blue-200 dark:hover:border-blue-800",
    route: "/app/resume-builder",
  },
  {
    id: "tailor",
    icon: Sparkles,
    color: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    borderHover: "hover:border-violet-200 dark:hover:border-violet-800",
    route: "/app/upload",
  },
  {
    id: "api",
    icon: Code2,
    color: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    borderHover: "hover:border-emerald-200 dark:hover:border-emerald-800",
    route: "/app/api-keys",
  },
];

export function OnboardingHub() {
  const t = useTranslations("onboarding.hub");
  const router = useRouter();
  const { setPrimaryIntent, skipOnboarding, completeOnboarding } =
    useOnboarding();

  const handleIntentSelect = (intent: (typeof intents)[number]) => {
    setPrimaryIntent(intent.id);
    // Navigate first, then mark onboarding complete after a tick
    // to prevent the PersonalizedDashboard from briefly flashing
    router.push(intent.route);
    setTimeout(() => completeOnboarding(), 0);
  };

  const handleExplore = () => {
    skipOnboarding();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10 max-w-lg">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t("subtitle")}
        </p>
      </div>

      {/* Intent Cards */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3 w-full max-w-2xl mb-10">
        {intents.map((intent) => {
          const Icon = intent.icon;

          return (
            <button
              key={intent.id}
              onClick={() => handleIntentSelect(intent)}
              className={[
                "group relative flex flex-col items-start gap-4 rounded-lg border p-5 sm:p-6 text-left",
                "transition-all duration-200 cursor-pointer",
                "border-border bg-card",
                intent.borderHover,
                "hover:shadow-sm",
              ].join(" ")}
            >
              {/* Icon */}
              <div
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  intent.iconBg,
                ].join(" ")}
              >
                <Icon className={["h-5 w-5", intent.color].join(" ")} />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <h3 className="font-medium text-sm">
                  {t(`${intent.id}.title`)}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(`${intent.id}.description`)}
                </p>
              </div>

              {/* Hover arrow */}
              <div className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className={intent.color}>{t("getStarted")}</span>
                <ArrowRight className={["h-3 w-3", intent.color].join(" ")} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Skip / Explore */}
      <button
        onClick={handleExplore}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("explore")}
      </button>
    </div>
  );
}
