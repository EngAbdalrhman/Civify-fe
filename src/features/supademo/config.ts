export const SUPADEMO_RESUME_BUILDER_ID =
  process.env.NEXT_PUBLIC_SUPADEMO_RESUME_BUILDER_ID ??
  "cmpmbmqa43yfiqms93d8gz2mf";

export const SUPADEMO_TAILOR_ID =
  process.env.NEXT_PUBLIC_SUPADEMO_TAILOR_ID ?? "";

export function isSupademoTailorTourAvailable(): boolean {
  return SUPADEMO_TAILOR_ID.trim().length > 0;
}
