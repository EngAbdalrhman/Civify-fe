import type { ResumeData, ResumeSection } from "@/features/upload-cv/types";

/** Infer section type from title when parser leaves type as custom or missing */
function inferSectionType(section: ResumeSection): ResumeSection["type"] {
  if (
    section.type &&
    section.type !== "custom" &&
    [
      "experience",
      "education",
      "skills",
      "languages",
      "projects",
      "certifications",
    ].includes(section.type)
  ) {
    return section.type;
  }

  const title = section.title.toLowerCase();
  if (title.includes("experience") || title.includes("employment") || title.includes("work history")) {
    return "experience";
  }
  if (title.includes("education") || title.includes("academic")) {
    return "education";
  }
  if (title.includes("skill") || title.includes("competenc")) {
    return "skills";
  }
  if (title.includes("language")) {
    return "languages";
  }
  if (title.includes("project")) {
    return "projects";
  }
  if (title.includes("certif") || title.includes("course") || title.includes("license")) {
    return "certifications";
  }
  return section.type || "custom";
}

/** Normalize parsed/uploaded resume sections for the review editor */
export function normalizeUploadResumeData(data: ResumeData): ResumeData {
  return {
    ...data,
    sections: data.sections.map((section, index) => ({
      ...section,
      type: inferSectionType(section),
      visible: section.visible ?? section.isVisible ?? true,
      order: section.order ?? index,
    })),
  };
}
