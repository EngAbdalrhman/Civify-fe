"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface TemplateStepProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
}

const templates = [
  {
    id: "modern",
    preview: "🎨",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "classic",
    preview: "📄",
    color: "from-gray-600 to-gray-800",
  },
  {
    id: "minimal",
    preview: "✨",
    color: "from-slate-400 to-slate-600",
  },
  {
    id: "professional",
    preview: "💼",
    color: "from-indigo-500 to-purple-600",
  },
];

export function TemplateStep({
  selectedTemplate,
  onSelect,
}: TemplateStepProps) {
  const t = useTranslations("onboarding.steps.template");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={cn(
                "group relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50",
              )}
            >
              {/* Template Preview */}
              <div
                className={cn(
                  "flex h-24 w-full items-center justify-center rounded-lg bg-gradient-to-br text-4xl",
                  template.color,
                )}
              >
                {template.preview}
              </div>

              {/* Template Name */}
              <span className="font-medium">
                {t(`templates.${template.id}`)}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">{t("hint")}</p>
    </div>
  );
}
