"use client";

import type { DriveStep } from "driver.js";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTourWelcomePrompt } from "../hooks/useTourWelcomePrompt";

interface TourWelcomePromptProps {
  pageId: string;
  steps: DriveStep[];
  enabled?: boolean;
  delay?: number;
}

export function TourWelcomePrompt({
  pageId,
  steps,
  enabled = true,
  delay,
}: TourWelcomePromptProps) {
  const t = useTranslations("tour.common");
  const { visible, start, dismiss } = useTourWelcomePrompt({
    pageId,
    steps,
    enabled,
    delay,
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) dismiss();
  };

  return (
    <Dialog open={visible} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader className="items-center text-center sm:items-center sm:text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <DialogTitle>{t("promptTitle")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("promptDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button type="button" className="w-full" onClick={start}>
            {t("promptStart")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={dismiss}
          >
            {t("promptDismiss")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
