"use client";

import { useTranslations } from "next-intl";
import { ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getTemplateAtsPillClassName,
  getTemplateAtsTierKey,
  getTemplateAtsTierLabelKey,
} from "../utils/templateAtsLabels";

interface TemplateAtsPillProps {
  templateId: string;
  className?: string;
}

export function TemplateAtsPill({ templateId, className }: TemplateAtsPillProps) {
  const t = useTranslations("design.template");
  const tier = getTemplateAtsTierKey(templateId);
  const tierKey = getTemplateAtsTierLabelKey(tier);
  const tierLabel = t.has(`atsTier.${tierKey}` as never)
    ? t(`atsTier.${tierKey}` as never)
    : tierKey;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium leading-none",
        getTemplateAtsPillClassName(tier),
        className,
      )}
      title={t.has("atsParseabilityHint" as never) ? t("atsParseabilityHint" as never) : undefined}
    >
      <ScanSearch className="h-3 w-3 opacity-70" aria-hidden />
      <span className="text-muted-foreground/80 font-normal">ATS</span>
      <span>{tierLabel}</span>
    </span>
  );
}
