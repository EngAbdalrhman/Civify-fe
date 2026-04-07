"use client";

import { CheckCircle2, CloudOff, Loader2, PencilLine } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { BuilderSaveStatus as SaveStatus } from "@/features/resume-builder/types";
import { cn } from "@/lib/utils";

interface BuilderSaveStatusProps {
  status: SaveStatus;
  lastSavedAt: string | null;
}

function formatSavedTime(timestamp: string, locale: string) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function BuilderSaveStatus({
  status,
  lastSavedAt,
}: BuilderSaveStatusProps) {
  const t = useTranslations("builder.saveStatus");
  const locale = useLocale();
  const tr = (key: string, fallback: string, values?: Record<string, string>) => {
    if (!t.has(key as never)) {
      return fallback;
    }

    return values ? t(key as never, values as never) : t(key as never);
  };

  const statusConfig = {
    saved: {
      icon: CheckCircle2,
      label: tr("saved", "Saved"),
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    saving: {
      icon: Loader2,
      label: tr("saving", "Saving"),
      className: "border-sky-200 bg-sky-50 text-sky-700",
    },
    unsaved: {
      icon: PencilLine,
      label: tr("unsaved", "Unsaved changes"),
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    error: {
      icon: CloudOff,
      label: tr("error", "Save failed"),
      className: "border-destructive/20 bg-destructive/10 text-destructive",
    },
  } satisfies Record<
    SaveStatus,
    { icon: typeof CheckCircle2; label: string; className: string }
  >;

  const config = statusConfig[status];
  const Icon = config.icon;
  const formattedTime = lastSavedAt ? formatSavedTime(lastSavedAt, locale) : null;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
          config.className,
        )}
      >
        <Icon className={cn("h-3.5 w-3.5", status === "saving" && "animate-spin")} />
        <span>{config.label}</span>
      </div>
      {status === "saved" && formattedTime ? (
        <span className="text-xs text-muted-foreground">
          {tr("lastSaved", `Last saved ${formattedTime}`, {
            time: formattedTime,
          })}
        </span>
      ) : null}
    </div>
  );
}
