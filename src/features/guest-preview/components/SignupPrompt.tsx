"use client";

import { ArrowRight, Lock, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface SignupPromptProps {
  matchScore?: number;
  onBack?: () => void;
}

export function SignupPrompt({ matchScore, onBack }: SignupPromptProps) {
  const t = useTranslations("guestPreview.signup");

  return (
    <div className="mx-auto max-w-md text-center">
      {/* Icon */}
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600">
        <Sparkles className="h-8 w-8 text-white" />
      </div>

      {/* Match Score Badge */}
      {matchScore && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 dark:bg-green-900/30">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {matchScore}%
          </span>
          <span className="text-sm text-green-700 dark:text-green-300">
            {t("matchScore")}
          </span>
        </div>
      )}

      {/* Title */}
      <h2 className="mb-2 text-2xl font-bold">{t("title")}</h2>
      <p className="mb-6 text-muted-foreground">{t("subtitle")}</p>

      {/* Benefits List */}
      <div className="mb-6 rounded-lg border bg-muted/50 p-4 text-left">
        <h4 className="mb-3 font-medium">{t("benefits.title")}</h4>
        <ul className="space-y-2">
          {["fullCv", "download", "multipleVersions", "atsScore"].map((key) => (
            <li key={key} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              {t(`benefits.${key}`)}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-3">
        <Button asChild size="lg" className="w-full">
          <Link href="/auth/signup">
            {t("signupCta")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/auth/login">{t("loginCta")}</Link>
        </Button>
      </div>

      {/* Security note */}
      <p className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        {t("securityNote")}
      </p>

      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {t("back")}
        </button>
      )}
    </div>
  );
}
