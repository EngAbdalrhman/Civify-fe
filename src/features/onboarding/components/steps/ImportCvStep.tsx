"use client";

import { useRef } from "react";
import { Upload, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ImportCvStepProps {
  hasExistingCv: boolean;
  onHasExistingCvChange: (value: boolean) => void;
  onFileUpload?: (file: File) => void;
  isUploading?: boolean;
}

export function ImportCvStep({
  hasExistingCv,
  onHasExistingCvChange,
  onFileUpload,
  isUploading = false,
}: ImportCvStepProps) {
  const t = useTranslations("onboarding.steps.import");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
      onHasExistingCvChange(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Upload existing CV */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "group flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-6 transition-all",
            hasExistingCv
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-medium">{t("upload.title")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("upload.description")}
            </p>
          </div>
        </button>

        {/* Start from scratch */}
        <button
          onClick={() => onHasExistingCvChange(false)}
          className={cn(
            "group flex flex-col items-center gap-4 rounded-xl border-2 p-6 transition-all",
            !hasExistingCv
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 transition-transform group-hover:scale-110 dark:bg-green-900/30">
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-center">
            <h3 className="font-medium">{t("scratch.title")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("scratch.description")}
            </p>
          </div>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-center text-xs text-muted-foreground">{t("hint")}</p>
    </div>
  );
}
