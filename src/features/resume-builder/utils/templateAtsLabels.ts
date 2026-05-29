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

export function getTemplateAtsBadge(templateId: string): {
  label: string;
  className: string;
} {
  const tier = TEMPLATE_ATS_TIER[templateId] ?? "caution";
  switch (tier) {
    case "excellent":
      return {
        label: "ATS: Excellent",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      };
    case "good":
      return {
        label: "ATS: Good",
        className:
          "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      };
    case "caution":
      return {
        label: "ATS: Moderate",
        className:
          "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
      };
    case "poor":
      return {
        label: "ATS: Low",
        className:
          "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200",
      };
  }
}
