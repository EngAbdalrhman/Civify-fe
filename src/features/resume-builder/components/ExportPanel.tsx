"use client";

import { ResumeData } from "@/features/upload-cv/types";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, FileType, Loader2 } from "lucide-react";
import {
  exportToPdfPuppeteer,
  exportToDocx,
  type TemplateType,
} from "@/features/upload-cv/utils/exportCv";
import { toast } from "sonner";
import { useState } from "react"; // Added useState import

import enTranslations from "@/messages/en";
import arTranslations from "@/messages/ar";

interface ExportPanelProps {
  data: ResumeData;
  isGuest?: boolean;
  onAuthGate?: () => void;
}

import { useTranslations } from "next-intl";

export function ExportPanel({
  data,
  isGuest = false,
  onAuthGate,
}: ExportPanelProps) {
  const t = useTranslations("builder.exportPanel");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const getTranslations = () => {
    return data.metadata?.language === "ar" ? arTranslations : enTranslations;
  };

  const handlePdfExport = async () => {
    if (isGuest && onAuthGate) {
      onAuthGate();
      return;
    }
    if (isExportingPdf || isExportingDocx) return;

    setIsExportingPdf(true);
    try {
      const template = (data.metadata?.templateId || "modern") as TemplateType;
      const color = data.metadata?.primaryColor || "#000000";
      const filename = `${data.personalInfo.fullName.replace(/\s+/g, "_")}_CV`;

      await exportToPdfPuppeteer(data, {
        filename,
        template,
        color,
      });
      // toast.success("PDF Downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDocxExport = async () => {
    if (isGuest && onAuthGate) {
      onAuthGate();
      return;
    }
    if (isExportingPdf || isExportingDocx) return;

    setIsExportingDocx(true);
    try {
      const translations = getTranslations();
      await exportToDocx(
        data,
        `${data.personalInfo.fullName.replace(/\s+/g, "_")}_CV`,
        translations,
      );
      // toast.success("DOCX Downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export DOCX");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const isExporting = isExportingPdf || isExportingDocx;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4">
        <Card
          className={`cursor-pointer transition-colors ${
            isExporting
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-primary"
          }`}
          onClick={handlePdfExport}
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              {isExportingPdf ? (
                <Loader2 className="h-6 w-6 text-red-600 dark:text-red-400 animate-spin" />
              ) : (
                <FileType className="h-6 w-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base">
                {isExportingPdf ? t("pdf.exporting") : t("pdf.title")}
              </CardTitle>
              <CardDescription>{t("pdf.description")}</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            isExporting
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-primary"
          }`}
          onClick={handleDocxExport}
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              {isExportingDocx ? (
                <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
              ) : (
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base">
                {isExportingDocx ? t("docx.exporting") : t("docx.title")}
              </CardTitle>
              <CardDescription>{t("docx.description")}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg text-sm text-balance text-muted-foreground text-center">
        {t("tip")}
      </div>
    </div>
  );
}
