"use client";

import { ResumeData } from "@/features/upload-cv/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, FileType } from "lucide-react";
import {
  exportToPdfPuppeteer,
  exportToDocx,
  type TemplateType,
} from "@/features/upload-cv/utils/exportCv";
import { toast } from "sonner";

import enTranslations from "@/messages/en.json";
import arTranslations from "@/messages/ar.json";

interface ExportPanelProps {
  data: ResumeData;
}

import { useTranslations } from "next-intl";

// ... (imports)

export function ExportPanel({ data }: ExportPanelProps) {
  const t = useTranslations("builder.exportPanel");

  const getTranslations = () => {
    return data.metadata?.language === "ar" ? arTranslations : enTranslations;
  };

  const handlePdfExport = async () => {
    try {
      const template = (data.metadata?.templateId || "modern") as TemplateType;
      const color = data.metadata?.primaryColor || "#000000";
      const filename = `${data.personalInfo.fullName.replace(/\s+/g, "_")}_CV`;

      await exportToPdfPuppeteer(data, {
        filename,
        template,
        color,
      });
      toast.success("PDF Downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF");
    }
  };

  const handleDocxExport = async () => {
    try {
      const translations = getTranslations();
      await exportToDocx(
        data,
        `${data.personalInfo.fullName.replace(/\s+/g, "_")}_CV`,
        translations,
      );
      toast.success("DOCX Downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export DOCX");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4">
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={handlePdfExport}
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <FileType className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base">{t("pdf.title")}</CardTitle>
              <CardDescription>{t("pdf.description")}</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={handleDocxExport}
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base">{t("docx.title")}</CardTitle>
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
