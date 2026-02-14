"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResumeData } from "@/features/upload-cv/types";
import { useTranslations } from "next-intl";

interface PersonalInfoFormProps {
  data: ResumeData["personalInfo"];
  onChange: (data: ResumeData["personalInfo"]) => void;
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const t = useTranslations("editor.personalForm");

  const handleChange = (
    field: keyof ResumeData["personalInfo"],
    value: string,
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("fullName")}</Label>
          <Input
            value={data.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder={t("fullNamePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("jobTitle")}</Label>
          <Input
            value={data.jobTitle || ""}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            placeholder={t("jobTitlePlaceholder")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("email")}</Label>
          <Input
            value={data.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder={t("emailPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("phone")}</Label>
          <Input
            value={data.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder={t("phonePlaceholder")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("address")}</Label>
        <Input
          value={data.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder={t("addressPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("summary")}</Label>
        <Textarea
          value={data.summary || ""}
          onChange={(e) => handleChange("summary", e.target.value)}
          placeholder={t("summaryPlaceholder")}
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>{t("linkedin")}</Label>
          <Input
            value={data.linkedin || ""}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            placeholder={t("linkedinPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("github")}</Label>
          <Input
            value={data.github || ""}
            onChange={(e) => handleChange("github", e.target.value)}
            placeholder={t("githubPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("website")}</Label>
          <Input
            value={data.website || ""}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder={t("websitePlaceholder")}
          />
        </div>
      </div>
    </div>
  );
}
