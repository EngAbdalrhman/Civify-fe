import type { ChartDataPoint } from "../types/analytics.types";

/**
 * Calculate days until the usage reset date
 */
export function getDaysUntilReset(
  usageResetDate: string | undefined,
): number | null {
  if (!usageResetDate) return null;
  const resetDate = new Date(usageResetDate);
  const today = new Date();
  const diffTime = resetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Calculate CV usage percentage
 */
export function calculateCvUsagePercent(
  currentCvCount: number | undefined,
  cvLimit: number | null,
): number {
  if (!cvLimit || !currentCvCount) return 0;
  return Math.round((currentCvCount / cvLimit) * 100);
}

/**
 * Generate mock chart data based on current CV count
 */
export function generateMockGenerationsData(
  currentCvCount: number | undefined,
): ChartDataPoint[] {
  const count = currentCvCount ?? 0;
  return [
    { name: "Week 1", generations: Math.round(count * 0.2) },
    { name: "Week 2", generations: Math.round(count * 0.3) },
    { name: "Week 3", generations: Math.round(count * 0.25) },
    { name: "Week 4", generations: Math.round(count * 0.25) },
  ];
}
