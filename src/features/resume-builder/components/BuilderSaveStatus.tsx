"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BuilderSaveStatus as SaveStatusType } from "@/features/resume-builder/types";

interface BuilderSaveStatusProps {
  status: SaveStatusType;
  lastSavedAt: string | null;
}

function useTimeAgo(isoDate: string | null): string {
  const t = useTranslations("builder.saveStatus");
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!isoDate) {
      setLabel("");
      return;
    }

    const update = () => {
      const seconds = Math.floor(
        (Date.now() - new Date(isoDate).getTime()) / 1000,
      );
      if (seconds < 5) {
        setLabel(t("justNow"));
      } else if (seconds < 60) {
        setLabel(t("secondsAgo", { count: seconds }));
      } else {
        const minutes = Math.floor(seconds / 60);
        setLabel(t("minutesAgo", { count: minutes }));
      }
    };

    update();
    const interval = setInterval(update, 10_000);
    return () => clearInterval(interval);
  }, [isoDate, t]);

  return label;
}

export function BuilderSaveStatus({
  status,
  lastSavedAt,
}: BuilderSaveStatusProps) {
  const t = useTranslations("builder.saveStatus");
  const timeAgo = useTimeAgo(lastSavedAt);

  if (status === "idle" && !lastSavedAt) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{t("saving")}</span>
        </>
      )}
      {status === "saved" && (
        <>
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          <span>
            {t("saved")}
            {timeAgo ? ` · ${timeAgo}` : ""}
          </span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span>{t("error")}</span>
        </>
      )}
      {status === "idle" && lastSavedAt && (
        <>
          <CheckCircle2 className="h-3 w-3 text-emerald-500/60" />
          <span>{timeAgo}</span>
        </>
      )}
    </div>
  );
}
