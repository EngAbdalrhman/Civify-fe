import { v4 as uuidv4 } from "uuid";
import {
  ResumeData,
  ResumeSection,
  SectionItem,
  emptyResumeData,
} from "@/features/upload-cv/types";
import { ensureUniqueSectionItemIds } from "@/features/resume-builder/utils/normalizeResumeIds";
import { LinkedInImportSelection } from "@/features/resume-builder/types";

const SECTION_HEADINGS = new Map<string, ResumeSection["type"]>([
  ["about", "custom"],
  ["summary", "custom"],
  ["experience", "experience"],
  ["work experience", "experience"],
  ["education", "education"],
  ["skills", "skills"],
  ["core skills", "skills"],
  ["certifications", "certifications"],
  ["licenses & certifications", "certifications"],
  ["projects", "projects"],
]);

const CONTACT_PREFIXES = ["email", "phone", "mobile", "website", "linkedin", "github"];

function createBaseResume(): ResumeData {
  return {
    ...emptyResumeData,
    sections: emptyResumeData.sections.map((section) => ({
      ...section,
      items: [],
    })),
  };
}

function normalizeLine(line: string) {
  return line.replace(/\u2022/g, "").replace(/\t/g, " ").trim();
}

function isSectionHeading(line: string) {
  return SECTION_HEADINGS.has(line.toLowerCase());
}

function slugifySectionId(type: ResumeSection["type"]) {
  return `${type}-${uuidv4()}`;
}

function parseDateRange(line: string): Pick<SectionItem, "date" | "startDate" | "endDate"> {
  const raw = line.trim();
  if (!raw) {
    return { date: "" };
  }

  const normalized = raw
    .replace(/[–—]/g, "-")
    .replace(/\bto\b/gi, "-")
    .replace(/\s+/g, " ")
    .trim();

  const parts = normalized.split("-").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    return { date: raw };
  }

  const startDate = parseSingleDate(parts[0]);
  const endRaw = parts.slice(1).join(" - ");
  const endDate =
    /present|current|now/i.test(endRaw) ? "Present" : parseSingleDate(endRaw);

  return {
    date: `${startDate || parts[0]} - ${endDate || endRaw}`,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };
}

function parseSingleDate(value: string): string | null {
  const trimmed = value.trim();
  const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
  if (!yearMatch) return null;

  const year = yearMatch[0];
  const monthMatch = trimmed.match(
    /\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\b/i,
  );

  if (!monthMatch) {
    return `${year}-01`;
  }

  const monthMap: Record<string, string> = {
    jan: "01",
    january: "01",
    feb: "02",
    february: "02",
    mar: "03",
    march: "03",
    apr: "04",
    april: "04",
    may: "05",
    jun: "06",
    june: "06",
    jul: "07",
    july: "07",
    aug: "08",
    august: "08",
    sep: "09",
    sept: "09",
    september: "09",
    oct: "10",
    october: "10",
    nov: "11",
    november: "11",
    dec: "12",
    december: "12",
  };

  return `${year}-${monthMap[monthMatch[0].toLowerCase()]}`;
}

function parseSkills(content: string): SectionItem[] {
  return content
    .split(/\n|,|·|\||;/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1)
    .slice(0, 30)
    .map((title) => ({
      id: `skill-${uuidv4()}`,
      title,
      visible: true,
    }));
}

function splitBlocks(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split("\n")
        .map(normalizeLine)
        .filter(Boolean),
    )
    .filter((block) => block.length > 0);
}

function looksLikeDateLine(line: string) {
  return /(19|20)\d{2}/.test(line) && /-|present|current|now/i.test(line);
}

function looksLikeLocation(line: string) {
  return !looksLikeDateLine(line) && /,|remote|hybrid|onsite/i.test(line);
}

function parseStructuredSection(content: string): SectionItem[] {
  return splitBlocks(content).map((lines) => {
    const [first = "", second = ""] = lines;
    const dateLine = lines.find(looksLikeDateLine) || "";
    const locationLine = lines.find(
      (line) => line !== dateLine && looksLikeLocation(line),
    );

    const consumed = new Set<string>([first, second]);
    if (dateLine) consumed.add(dateLine);
    if (locationLine) consumed.add(locationLine);

    const description = lines
      .filter((line) => !consumed.has(line))
      .join("\n");

    const maybeSubtitle =
      second && !looksLikeDateLine(second) && !looksLikeLocation(second)
        ? second
        : locationLine && second === locationLine
          ? ""
          : second;

    return {
      id: `item-${uuidv4()}`,
      title: first,
      subtitle: maybeSubtitle || undefined,
      location: locationLine || undefined,
      description: description || undefined,
      visible: true,
      ...parseDateRange(dateLine),
    };
  });
}

function extractSummary(lines: string[]) {
  return lines
    .filter((line) => line.length > 0 && !isSectionHeading(line))
    .join("\n")
    .trim();
}

function findOrCreateSection(
  sections: ResumeSection[],
  type: ResumeSection["type"],
  title: string,
) {
  const existing = sections.find((section) => section.type === type);
  if (existing) {
    existing.title = existing.title || title;
    return existing;
  }

  const created: ResumeSection = {
    id: slugifySectionId(type),
    title,
    type,
    items: [],
    visible: true,
    order: sections.length,
  };
  sections.push(created);
  return created;
}

function extractContactInfo(resume: ResumeData, lines: string[], sourceUrl: string) {
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const lower = line.toLowerCase();
    if (CONTACT_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
      const value = line.split(":").slice(1).join(":").trim();
      if (!value) continue;

      if (lower.startsWith("email")) resume.personalInfo.email = value;
      if (lower.startsWith("phone") || lower.startsWith("mobile")) {
        resume.personalInfo.phone = value;
      }
      if (lower.startsWith("website")) resume.personalInfo.website = value;
      if (lower.startsWith("linkedin")) resume.personalInfo.linkedin = value;
      if (lower.startsWith("github")) resume.personalInfo.github = value;
      continue;
    }

    if (!resume.personalInfo.email) {
      const email = line.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
      if (email) resume.personalInfo.email = email;
    }

    if (!resume.personalInfo.phone) {
      const phone = line.match(/(\+\d[\d\s().-]{7,}\d)/)?.[0];
      if (phone) resume.personalInfo.phone = phone.trim();
    }

    if (!resume.personalInfo.github && /github\.com/i.test(line)) {
      resume.personalInfo.github = line.trim();
    }

    if (!resume.personalInfo.website && /https?:\/\//i.test(line)) {
      resume.personalInfo.website = line.trim();
    }
  }

  if (sourceUrl) {
    resume.personalInfo.linkedin = sourceUrl;
  }
}

export function parseLinkedInImport(sourceText: string, sourceUrl = ""): ResumeData {
  const resume = createBaseResume();
  const rawLines = sourceText
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean);

  if (rawLines.length === 0) {
    return resume;
  }

  resume.personalInfo.fullName = rawLines[0] || "";
  resume.personalInfo.jobTitle = rawLines[1] && !isSectionHeading(rawLines[1]) ? rawLines[1] : "";

  extractContactInfo(resume, rawLines, sourceUrl);

  const sectionsContent = new Map<string, string[]>();
  let currentSection = "about";

  for (const line of rawLines.slice(2)) {
    const normalized = line.toLowerCase();
    if (isSectionHeading(normalized)) {
      currentSection = normalized;
      if (!sectionsContent.has(currentSection)) {
        sectionsContent.set(currentSection, []);
      }
      continue;
    }

    if (!sectionsContent.has(currentSection)) {
      sectionsContent.set(currentSection, []);
    }
    sectionsContent.get(currentSection)?.push(line);
  }

  const summary = extractSummary(sectionsContent.get("about") || []);
  if (summary) {
    resume.personalInfo.summary = summary;
  }

  for (const [heading, contentLines] of sectionsContent.entries()) {
    const type = SECTION_HEADINGS.get(heading);
    const content = contentLines.join("\n").trim();
    if (!type || !content) continue;
    if (heading === "about" || heading === "summary") continue;

    const title =
      type === "experience"
        ? "Work Experience"
        : type === "education"
          ? "Education"
          : type === "skills"
            ? "Skills"
            : type === "projects"
              ? "Projects"
              : "Certifications";

    const targetSection = findOrCreateSection(resume.sections, type, title);
    targetSection.items =
      type === "skills" ? parseSkills(content) : parseStructuredSection(content);
  }

  return ensureUniqueSectionItemIds(resume) as ResumeData;
}

function mergePersonalInfo(
  current: ResumeData["personalInfo"],
  imported: ResumeData["personalInfo"],
  includeSummary: boolean,
) {
  const merged = { ...current };

  for (const [key, value] of Object.entries(imported)) {
    if (!value) continue;
    if (key === "summary" && !includeSummary) continue;
    merged[key as keyof ResumeData["personalInfo"]] = value;
  }

  return merged;
}

function upsertSection(
  sections: ResumeSection[],
  importedSection: ResumeSection,
  mode: "append" | "replace",
) {
  const existingIndex = sections.findIndex(
    (section) => section.type === importedSection.type,
  );

  if (existingIndex === -1) {
    sections.push({
      ...importedSection,
      id: slugifySectionId(importedSection.type),
      items: importedSection.items.map((item) => ({
        ...item,
        id: `item-${uuidv4()}`,
      })),
      order: sections.length,
    });
    return;
  }

  const existing = sections[existingIndex];
  const mergedItems =
    mode === "replace"
      ? importedSection.items
      : [...existing.items, ...importedSection.items].map((item) => ({
          ...item,
          id: item.id || `item-${uuidv4()}`,
        }));

  sections[existingIndex] = {
    ...existing,
    title: existing.title || importedSection.title,
    items: mergedItems,
  };
}

export function mergeLinkedInImport(
  current: ResumeData,
  imported: ResumeData,
  selection: LinkedInImportSelection,
  mode: "append" | "replace",
) {
  const next: ResumeData = {
    ...current,
    personalInfo: selection.personalInfo
      ? mergePersonalInfo(current.personalInfo, imported.personalInfo, selection.summary)
      : selection.summary
        ? {
            ...current.personalInfo,
            summary: imported.personalInfo.summary || current.personalInfo.summary,
          }
        : current.personalInfo,
    sections: current.sections.map((section) => ({
      ...section,
      items: [...section.items],
    })),
  };

  const sectionByType = new Map(imported.sections.map((section) => [section.type, section]));

  if (selection.experience && sectionByType.has("experience")) {
    upsertSection(next.sections, sectionByType.get("experience")!, mode);
  }
  if (selection.education && sectionByType.has("education")) {
    upsertSection(next.sections, sectionByType.get("education")!, mode);
  }
  if (selection.skills && sectionByType.has("skills")) {
    upsertSection(next.sections, sectionByType.get("skills")!, mode);
  }
  if (selection.certifications && sectionByType.has("certifications")) {
    upsertSection(next.sections, sectionByType.get("certifications")!, mode);
  }
  if (selection.projects && sectionByType.has("projects")) {
    upsertSection(next.sections, sectionByType.get("projects")!, mode);
  }

  next.sections = next.sections.map((section, index) => ({
    ...section,
    order: index,
  }));

  return ensureUniqueSectionItemIds(next) as ResumeData;
}
