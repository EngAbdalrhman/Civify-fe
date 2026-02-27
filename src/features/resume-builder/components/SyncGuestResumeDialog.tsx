"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface SyncGuestResumeDialogProps {
  open: boolean;
  isSyncing: boolean;
  isSuccess: boolean;
}

export function SyncGuestResumeDialog({
  open,
  isSyncing,
  isSuccess,
}: SyncGuestResumeDialogProps) {
  const t = useTranslations("builder.sync");

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {isSuccess ? t("successTitle") : t("savingTitle")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSuccess ? t("successDescription") : t("savingDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          {isSyncing && !isSuccess && (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          )}
          {isSuccess && <CheckCircle2 className="h-10 w-10 text-green-500" />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
