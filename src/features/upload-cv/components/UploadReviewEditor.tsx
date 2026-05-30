"use client";

import { EditorPanel } from "@/features/resume-builder/components/EditorPanel";
import type { ResumeData } from "@/features/upload-cv/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface UploadReviewEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  className?: string;
}

/**
 * Upload flow step-2 editor — reuses resume builder forms (MonthPicker, section types, add-section dialog).
 */
export function UploadReviewEditor({ data, onChange, className }: UploadReviewEditorProps) {
  const t = useTranslations("upload");

  return (
    <Card
      data-tour="upload-step2-sections"
      className={cn(
        "border-border/60 bg-card dark:bg-zinc-950/40 dark:border-zinc-800/80",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle>{t("steps.reviewData")}</CardTitle>
        <CardDescription>{t("personalInfo.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <EditorPanel data={data} onChange={onChange} variant="upload" />
      </CardContent>
    </Card>
  );
}
