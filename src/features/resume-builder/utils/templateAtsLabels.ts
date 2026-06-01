/** ATS parseability tier per template (matches backend AtsCompatibilityService baselines). */
export type TemplateAtsTier = "excellent" | "good" | "caution" | "poor";

export const TEMPLATE_ATS_TIER: Record<string, TemplateAtsTier> = {
  ats: "excellent",
  minimal: "good",
  classic: "good",
  modern: "caution",
  executive: "caution",
  creative: "poor",
};

/** i18n key under design.template.atsTier.* (caution → moderate, poor → low) */
export function getTemplateAtsTierKey(templateId: string): TemplateAtsTier {
  return TEMPLATE_ATS_TIER[templateId] ?? "caution";
}

export function getTemplateAtsTierLabelKey(tier: TemplateAtsTier): string {
  if (tier === "caution") return "moderate";
  if (tier === "poor") return "low";
  return tier;
}

/** Subtle pill styles — outline + low saturation for dark mode */
export function getTemplateAtsPillClassName(tier: TemplateAtsTier): string {
  switch (tier) {
    case "excellent":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "good":
      return "border-emerald-500/20 bg-muted/50 text-emerald-800/90 dark:text-emerald-300/90";
    case "caution":
      return "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300/90";
    case "poor":
      return "border-orange-500/25 bg-orange-500/10 text-orange-800 dark:text-orange-300/90";
  }
}

/** @deprecated Use getTemplateAtsTierKey + getTemplateAtsPillClassName in UI */
export function getTemplateAtsBadge(templateId: string): {
  label: string;
  className: string;
} {
  const tier = getTemplateAtsTierKey(templateId);
  const labels: Record<TemplateAtsTier, string> = {
    excellent: "Excellent",
    good: "Good",
    caution: "Moderate",
    poor: "Low",
  };
  return {
    label: labels[tier],
    className: getTemplateAtsPillClassName(tier),
  };
}
