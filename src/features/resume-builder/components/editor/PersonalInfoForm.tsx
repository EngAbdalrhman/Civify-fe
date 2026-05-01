"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResumeData } from "@/features/upload-cv/types";
import { useTranslations } from "next-intl";

interface PersonalInfoFormProps {
  data: ResumeData["personalInfo"];
  onChange: (data: ResumeData["personalInfo"]) => void;
  templateId?: string;
}

export function PersonalInfoForm({ data, onChange, templateId }: PersonalInfoFormProps) {
  const t = useTranslations("editor.personalForm");

  const handleChange = (
    field: keyof ResumeData["personalInfo"],
    value: string,
  ) => {
    onChange({ ...data, [field]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleChange('picture', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePicture = () => {
    onChange({ ...data, picture: undefined });
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
          <Label>{t("jobTitle") || "Job Title"}</Label>
          <Input
            value={data.jobTitle || ""}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            placeholder={t("jobTitlePlaceholder") || "e.g. Software Engineer"}
          />
        </div>
      </div>

      {templateId === 'creative' && (
      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <div className="flex items-center gap-4">
          {data.picture && (
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200">
              <img src={data.picture} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
          </div>
          {data.picture && (
            <button
              onClick={removePicture}
              className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      )}

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
