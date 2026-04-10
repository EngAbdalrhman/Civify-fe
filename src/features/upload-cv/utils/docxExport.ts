/**
 * DOCX Export Module
 *
 * Dedicated module for generating Word documents from ResumeData.
 * Supports language-aware section headers (EN/AR) and multiple section types.
 */

import { saveAs } from "file-saver";
import type { ResumeData, ResumeSection, SectionItem } from "../types";
import {
  normalizeGitHubUrl,
  normalizeLinkedInUrl,
  normalizeWebsiteUrl,
} from "@/features/resume-builder/utils/socialLinks";

// ── Helpers ────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    saveAs(blob, filename);
  }
}

function filterVisibleItems(items: SectionItem[] | undefined): SectionItem[] {
  return (items || []).filter((i) => i.visible !== false);
}

// ── Main export function ───────────────────────────────────────

/**
 * Generate and download a DOCX file from resume data.
 *
 * @param resumeData  The structured resume data to render.
 * @param filename    Base filename (without extension).
 * @param translations  Optional i18n object – `translations.resume.sections[key]`
 *                      is used to localise section headers.
 */
export async function exportResumeToDocx(
  resumeData: ResumeData,
  filename: string = "cv",
  translations?: any,
): Promise<void> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Table,
    TableRow,
    TableCell,
    BorderStyle,
    WidthType,
    ExternalHyperlink,
  } = await import("docx");

  const { personalInfo, sections } = resumeData;
  const metadata = resumeData.metadata;

  // ── Section-type helpers ─────────────────────────────────────

  const shouldUseSimpleColumnsDocx = (section: ResumeSection): boolean => {
    if (section.type === "skills" || section.type === "languages") return false;
    const lowerTitle = (section.title || "").toLowerCase();
    const isCourse =
      section.type === "certifications" ||
      lowerTitle.includes("course") ||
      lowerTitle.includes("certif");
    const isSimpleList =
      lowerTitle.includes("interest") || lowerTitle.includes("hobb");
    const coursesStyle = metadata?.coursesDisplayStyle ?? "simple";
    return isSimpleList || (isCourse && coursesStyle === "simple");
  };

  const simpleColumnsColCount = (section: ResumeSection): number =>
    metadata?.sectionColumns?.[section.id] ?? 3;

  // ── Localised header helpers ─────────────────────────────────

  const getHeader = (key: string, defaultText: string) =>
    translations?.resume?.sections?.[key] ?? defaultText;

  const getSectionTitle = (sectionType: string, defaultTitle: string) =>
    translations?.resume?.sections?.[sectionType] ?? defaultTitle;

  // ── Border presets ───────────────────────────────────────────

  const noBorder = { style: BorderStyle.NONE, size: 0, color: "auto" };
  const cellBorders = {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
  };
  const tableOuterBorders = {
    ...cellBorders,
    insideHorizontal: noBorder,
    insideVertical: noBorder,
  };

  // ── Build document children ──────────────────────────────────

  const children: any[] = [];

  // --- Personal info header ---
  children.push(
    new Paragraph({
      text: personalInfo.fullName,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  );

  // --- Contact line ---
  const contactParts: string[] = [];
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.city || personalInfo.country) {
    contactParts.push(
      [personalInfo.city, personalInfo.country].filter(Boolean).join(", "),
    );
  }
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        text: contactParts.join(" | "),
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      }),
    );
  }

  // --- Links (clickable hyperlinks) ---
  const linkRuns: any[] = [];
  const pushLinkSep = () => {
    if (linkRuns.length > 0) linkRuns.push(new TextRun({ text: " | " }));
  };

  if (personalInfo.linkedin) {
    pushLinkSep();
    linkRuns.push(
      new ExternalHyperlink({
        children: [new TextRun({ text: "LinkedIn", style: "Hyperlink" })],
        link: normalizeLinkedInUrl(personalInfo.linkedin),
      }),
    );
  }
  if (personalInfo.github) {
    pushLinkSep();
    linkRuns.push(
      new ExternalHyperlink({
        children: [new TextRun({ text: "GitHub", style: "Hyperlink" })],
        link: normalizeGitHubUrl(personalInfo.github),
      }),
    );
  }
  if (personalInfo.website) {
    pushLinkSep();
    linkRuns.push(
      new ExternalHyperlink({
        children: [new TextRun({ text: "Website", style: "Hyperlink" })],
        link: normalizeWebsiteUrl(personalInfo.website),
      }),
    );
  }
  if (linkRuns.length > 0) {
    children.push(
      new Paragraph({
        children: linkRuns,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    );
  }

  // --- Summary ---
  if (personalInfo.summary) {
    children.push(
      new Paragraph({
        text: getHeader("summary", "PROFESSIONAL SUMMARY"),
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
        spacing: { before: 300, after: 200 },
      }),
    );
    children.push(
      new Paragraph({ text: personalInfo.summary, spacing: { after: 300 } }),
    );
  }

  // --- Visible sections ---
  const visibleSections = sections.filter(
    (s) =>
      s.visible !== false &&
      s.isVisible !== false &&
      s.items &&
      s.items.length > 0 &&
      s.items.some((i) => i.visible !== false),
  );

  for (const section of visibleSections) {
    const items = filterVisibleItems(section.items);
    if (items.length === 0) continue;

    // Section heading
    children.push(
      new Paragraph({
        text: getSectionTitle(section.type, section.title).toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
        spacing: { before: 300, after: 200 },
      }),
    );

    // --- Skills ---
    if (section.type === "skills") {
      const skillsStyle = resumeData?.metadata?.skillsDisplayStyle || "tags";
      if (skillsStyle === "tags") {
        const skills = items.map((item) => item.title).filter(Boolean);
        if (skills.length > 0) {
          children.push(
            new Paragraph({ text: skills.join(", "), spacing: { after: 200 } }),
          );
        }
      } else {
        for (const item of items) {
          const level = item.level || "intermediate";
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: item.title, bold: true }),
                new TextRun({ text: `  (${level})` }),
              ],
              spacing: { after: 100 },
            }),
          );
        }
      }

      // --- Languages ---
    } else if (section.type === "languages") {
      for (const item of items) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.title, bold: true }),
              new TextRun({ text: item.subtitle ? ` - ${item.subtitle}` : "" }),
            ],
            spacing: { after: 100 },
          }),
        );
      }
      // --- Simple column sections (certifications, interests, hobbies) ---
    } else if (shouldUseSimpleColumnsDocx(section)) {
      const colCount = simpleColumnsColCount(section);
      const rows = [];
      for (let i = 0; i < items.length; i += colCount) {
        const rowItems = items.slice(i, i + colCount);
        const cells = rowItems.map(
          (item) =>
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun(`• ${item.title}`)] }),
              ],
              borders: cellBorders,
            }),
        );
        while (cells.length < colCount) {
          cells.push(new TableCell({ children: [], borders: cellBorders }));
        }
        rows.push(new TableRow({ children: cells }));
      }
      children.push(
        new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableOuterBorders,
        }),
      );

      // --- Generic sections (experience, education, projects, etc.) ---
    } else {
      for (const item of items) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.title, bold: true }),
              new TextRun({ text: item.subtitle ? ` | ${item.subtitle}` : "" }),
            ],
            spacing: { after: 50 },
          }),
        );

        if (item.date || item.location) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: [item.date, item.location].filter(Boolean).join(" | "),
                  italics: true,
                }),
              ],
              spacing: { after: 100 },
            }),
          );
        }

        if (item.description) {
          const descLines = item.description
            .split("\n")
            .filter((l) => l.trim());
          for (const line of descLines) {
            children.push(
              new Paragraph({
                text:
                  line.startsWith("•") || line.startsWith("-")
                    ? line
                    : `• ${line}`,
                spacing: { after: 50 },
                indent: { left: 360 },
              }),
            );
          }
        }

        children.push(new Paragraph({ spacing: { after: 200 } }));
      }
    }
  }

  // ── Create & download document ───────────────────────────────

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${filename}.docx`);
}
