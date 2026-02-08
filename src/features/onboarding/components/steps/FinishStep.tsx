"use client";

import { Check, Briefcase, FileText, Palette } from "lucide-react";
import { useTranslations } from "next-intl";

interface FinishStepProps {
  jobTitle?: string;
  company?: string;
  template?: string;
  hasExistingCv: boolean;
}

export function FinishStep({
  jobTitle,
  company,
  template,
  hasExistingCv,
}: FinishStepProps) {
  const t = useTranslations("onboarding.steps.finish");

  const summaryItems = [
    {
      icon: Briefcase,
      label: t("targetJob"),
      value: jobTitle || t("notSpecified"),
      secondary: company,
    },
    {
      icon: Palette,
      label: t("template"),
      value: template ? t(`templates.${template}`) : t("notSelected"),
    },
    {
      icon: FileText,
      label: t("cvSource"),
      value: hasExistingCv ? t("uploadedCv") : t("startFresh"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Summary */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="mb-3 font-medium">{t("summary")}</h3>
        <div className="space-y-3">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.value}
                    {item.secondary && ` at ${item.secondary}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t("readyMessage")}
      </p>
    </div>
  );
}
