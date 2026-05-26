"use client";

import type { DriveStep } from "driver.js";
import { useTranslations } from "next-intl";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTourWelcomePrompt } from "../hooks/useTourWelcomePrompt";

interface TourWelcomePromptProps {
  pageId: string;
  steps: DriveStep[];
  enabled?: boolean;
  delay?: number;
  className?: string;
}

export function TourWelcomePrompt({
  pageId,
  steps,
  enabled = true,
  delay,
  className,
}: TourWelcomePromptProps) {
  const t = useTranslations("tour.common");
  const { visible, start, dismiss } = useTourWelcomePrompt({
    pageId,
    steps,
    enabled,
    delay,
  });

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby={`tour-prompt-title-${pageId}`}
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0">
          <p
            id={`tour-prompt-title-${pageId}`}
            className="font-medium text-foreground"
          >
            {t("promptTitle")}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("promptDescription")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button type="button" size="sm" onClick={start}>
          {t("promptStart")}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={dismiss}>
          {t("promptDismiss")}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 sm:hidden"
          onClick={dismiss}
          aria-label={t("promptDismiss")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
