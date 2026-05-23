import type { PersonalInfo, ResumeData } from "@/features/upload-cv/types";

const MASKED_NAME = "••••••••";
const MASKED_EMAIL = "••••••••@••••.•••";
const MASKED_PHONE = "•••••••••••";
const MASKED_GENERIC = "••••••••";
const MASKED_LOCATION = "••••";

/** Redact identifiable personal fields (preview + export only; does not mutate saved resume). */
export function maskPersonalInfo(info: PersonalInfo): PersonalInfo {
  return {
    ...info,
    fullName: MASKED_NAME,
    email: info.email ? MASKED_EMAIL : "",
    phone: info.phone ? MASKED_PHONE : "",
    address: info.address ? MASKED_LOCATION : undefined,
    city: info.city ? MASKED_LOCATION : undefined,
    country: info.country ? MASKED_LOCATION : undefined,
    linkedin: info.linkedin ? MASKED_GENERIC : undefined,
    github: info.github ? MASKED_GENERIC : undefined,
    website: info.website ? MASKED_GENERIC : undefined,
    picture: undefined,
  };
}

export function applyResumeMask(data: ResumeData, mask: boolean): ResumeData {
  if (!mask) return data;
  return {
    ...data,
    personalInfo: maskPersonalInfo(data.personalInfo),
  };
}

/** Generic filename for masked exports — never derived from the user's real name. */
export const MASKED_EXPORT_FILENAME = "Resume_Masked";

export function getMaskedExportFilename(): string {
  return MASKED_EXPORT_FILENAME;
}
