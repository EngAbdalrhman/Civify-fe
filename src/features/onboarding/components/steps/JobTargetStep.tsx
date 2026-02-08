"use client";

import { Briefcase, Building2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

interface JobTargetStepProps {
  jobTitle: string;
  company: string;
  jobDescription: string;
  onJobTitleChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
}

export function JobTargetStep({
  jobTitle,
  company,
  jobDescription,
  onJobTitleChange,
  onCompanyChange,
  onJobDescriptionChange,
}: JobTargetStepProps) {
  const t = useTranslations("onboarding.steps.jobTarget");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="space-y-4">
        {/* Job Title */}
        <div className="space-y-2">
          <Label htmlFor="jobTitle" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            {t("jobTitle")}
          </Label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => onJobTitleChange(e.target.value)}
            placeholder={t("jobTitlePlaceholder")}
          />
        </div>

        {/* Company */}
        <div className="space-y-2">
          <Label htmlFor="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t("company")}
            <span className="text-xs text-muted-foreground">
              ({t("optional")})
            </span>
          </Label>
          <Input
            id="company"
            value={company}
            onChange={(e) => onCompanyChange(e.target.value)}
            placeholder={t("companyPlaceholder")}
          />
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <Label htmlFor="jobDescription" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("jobDescription")}
            <span className="text-xs text-muted-foreground">
              ({t("optional")})
            </span>
          </Label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            placeholder={t("jobDescriptionPlaceholder")}
            className="min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {t("jobDescriptionHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
