import { saveAs } from "file-saver";

import type {
  ResumeData,
  ResumeSection,
  SectionItem,
  SkillLevel,
} from "../types";
import {
  normalizeGitHubUrl,
  normalizeLinkedInUrl,
  normalizeWebsiteUrl,
} from "@/features/resume-builder/utils/socialLinks";

type SupportedTemplate = "modern" | "classic" | "creative";

const LEVEL_VALUES: Record<SkillLevel, number> = {
  expert: 5,
  advanced: 4,
  intermediate: 3,
  beginner: 2,
  none: 1,
};

const LEVEL_LABELS: Record<SkillLevel, string> = {
  expert: "Expert",
  advanced: "Advanced",
  intermediate: "Intermediate",
  beginner: "Beginner",
  none: "",
};

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
  } catch (error) {
    console.warn("Native download failed, using file-saver fallback:", error);
    saveAs(blob, filename);
  }
}

function normalizeColor(value?: string, fallback: string = "000000"): string {
  if (!value) return fallback;
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return raw.toUpperCase();
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return raw
      .split("")
      .map((char) => `${char}${char}`)
      .join("")
      .toUpperCase();
  }
  return fallback;
}

function pxToTwip(value: number | undefined, fallback: number): number {
  return Math.round((value ?? fallback) * 15);
}

function parseLevel(value?: string): SkillLevel {
  if (!value) return "intermediate";
  const lower = value.toLowerCase();
  if (lower === "native" || lower === "fluent" || lower === "expert") {
    return "expert";
  }
  if (lower === "advanced") return "advanced";
  if (lower === "intermediate") return "intermediate";
  if (lower === "beginner") return "beginner";
  return "intermediate";
}

function resolveTemplate(templateId?: string): SupportedTemplate {
  if (
    templateId === "modern" ||
    templateId === "classic" ||
    templateId === "creative"
  ) {
    return templateId;
  }
  return "modern";
}

function getDirection(data: ResumeData): "ltr" | "rtl" {
  const layoutDirection = data.metadata?.layoutDirection;
  if (layoutDirection === "ltr" || layoutDirection === "rtl") {
    return layoutDirection;
  }
  return data.metadata?.language === "ar" ? "rtl" : "ltr";
}

function getVisibleSections(sections: ResumeSection[]): ResumeSection[] {
  return sections.filter(
    (section) =>
      section.visible !== false &&
      section.isVisible !== false &&
      Array.isArray(section.items) &&
      section.items.some((item) => item.visible !== false),
  );
}

function filterVisibleItems(items: SectionItem[] | undefined): SectionItem[] {
  return (items || []).filter((item) => item.visible !== false);
}

function shouldUseSimpleColumnsDocx(
  section: ResumeSection,
  resumeData: ResumeData,
): boolean {
  if (section.type === "skills" || section.type === "languages") return false;
  const lowerTitle = (section.title || "").toLowerCase();
  const isCourse =
    section.type === "certifications" ||
    lowerTitle.includes("course") ||
    lowerTitle.includes("certif");
  const isSimpleList =
    lowerTitle.includes("interest") || lowerTitle.includes("hobb");
  const coursesStyle = resumeData.metadata?.coursesDisplayStyle ?? "simple";
  return isSimpleList || (isCourse && coursesStyle === "simple");
}

function getColumnCount(section: ResumeSection, resumeData: ResumeData): number {
  return Math.max(1, resumeData.metadata?.sectionColumns?.[section.id] ?? 3);
}

function splitDescriptionLines(description?: string) {
  return (description || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const bullet = /^([•\u2022\-])\s*/.test(line);
      return {
        bullet,
        text: line.replace(/^([•\u2022\-])\s*/, "").trim(),
      };
    })
    .filter((line) => line.text);
}

export async function exportResumeToDocx(
  resumeData: ResumeData,
  filename: string = "cv",
  translations?: any,
): Promise<void> {
  const {
    AlignmentType,
    BorderStyle,
    Document,
    ExternalHyperlink,
    Packer,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    TextRun,
    VerticalAlign,
    WidthType,
  } = await import("docx");

  const { personalInfo } = resumeData;
  const metadata = resumeData.metadata;
  const template = resolveTemplate(metadata?.templateId);
  const direction = getDirection(resumeData);
  const isRtl = direction === "rtl";
  const alignmentStart = isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const alignmentEnd = isRtl ? AlignmentType.LEFT : AlignmentType.RIGHT;
  const accentColor = normalizeColor(metadata?.primaryColor, "000000");
  const bodyFont = metadata?.bodyFontFamily || metadata?.fontFamily || "Inter";
  const headingFont =
    metadata?.headingFontFamily || metadata?.fontFamily || bodyFont;
  const compactMode = metadata?.compactMode === true;
  const sectionGap = compactMode ? 180 : 260;
  const itemGap = compactMode ? 80 : 140;
  const textColor = "1F2937";
  const mutedColor = "6B7280";
  const subtleColor = "9CA3AF";
  const lightGray = "F3F4F6";
  const borderGray = "D1D5DB";
  const margins =
    metadata?.margins ||
    (template === "classic"
      ? { top: 40, bottom: 40, left: 40, right: 40 }
      : { top: 32, bottom: 32, left: 32, right: 32 });

  const cellBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  const tableOuterBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  const getHeader = (key: string, fallback: string) =>
    translations?.resume?.sections?.[key] || fallback;
  const getSectionTitle = (sectionType: string, fallback: string) =>
    translations?.resume?.sections?.[sectionType] || fallback;

  const labels = {
    linkedin: metadata?.language === "ar" ? "لينكد إن" : "LinkedIn",
    github: metadata?.language === "ar" ? "جيت هب" : "GitHub",
    profile:
      metadata?.language === "ar"
        ? "الملف الشخصي"
        : template === "creative"
          ? "Profile"
          : template === "classic"
            ? "Summary"
            : "Professional Summary",
  };

  const run = (
    text: string,
    options: {
      bold?: boolean;
      italics?: boolean;
      color?: string;
      size?: number;
      font?: string;
      allCaps?: boolean;
    } = {},
  ) =>
    new TextRun({
      text,
      bold: options.bold,
      italics: options.italics,
      color: options.color ?? textColor,
      size: options.size ?? 22,
      font: options.font ?? bodyFont,
      allCaps: options.allCaps,
      rightToLeft: isRtl,
    });

  const paragraph = (
    children: any[],
    options: {
      alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
      spacing?: { before?: number; after?: number; line?: number };
      border?: any;
      indent?: { left?: number };
      shading?: any;
    } = {},
  ) =>
    new Paragraph({
      children,
      alignment: options.alignment ?? alignmentStart,
      spacing: options.spacing,
      border: options.border,
      indent: options.indent,
      shading: options.shading,
      bidirectional: isRtl,
    });

  const hyperlink = (
    text: string,
    link: string,
    options: { color?: string; size?: number; font?: string } = {},
  ) =>
    new ExternalHyperlink({
      link,
      children: [
        new TextRun({
          text,
          color: options.color ?? accentColor,
          size: options.size ?? 20,
          font: options.font ?? bodyFont,
          rightToLeft: isRtl,
        }),
      ],
    });

  const joinInline = (parts: any[]) =>
    parts.flatMap((part, index) =>
      index === 0
        ? [part]
        : [run(" | ", { color: subtleColor, size: 20 }), part],
    );

  const createRatingRuns = (
    level: SkillLevel,
    displayStyle: "dots" | "bar" | "text",
    activeColor: string,
    inactiveColor: string,
    activeTextColor: string,
  ) => {
    if (displayStyle === "text") {
      return [
        run(LEVEL_LABELS[level] || "Intermediate", {
          italics: true,
          color: activeTextColor,
          size: 20,
        }),
      ];
    }

    const filled = LEVEL_VALUES[level] || 3;
    const fullChar = displayStyle === "bar" ? "■" : "●";
    const emptyChar = displayStyle === "bar" ? "□" : "○";

    return Array.from({ length: 5 }, (_, index) =>
      run(index < filled ? fullChar : emptyChar, {
        color: index < filled ? activeColor : inactiveColor,
        size: displayStyle === "bar" ? 18 : 20,
      }),
    );
  };

  const createSimpleColumnsTable = (
    items: SectionItem[],
    colCount: number,
    itemTextColor: string,
  ) => {
    const rows = [];

    for (let index = 0; index < items.length; index += colCount) {
      const rowItems = items.slice(index, index + colCount);
      const cells = rowItems.map(
        (item) =>
          new TableCell({
            children: [
              paragraph([run(`• ${item.title}`, { color: itemTextColor, size: 20 })], {
                spacing: { after: 60 },
              }),
            ],
            borders: cellBorders,
            width: { size: Math.floor(100 / colCount), type: WidthType.PERCENTAGE },
          }),
      );

      while (cells.length < colCount) {
        cells.push(
          new TableCell({
            children: [new Paragraph({})],
            borders: cellBorders,
            width: { size: Math.floor(100 / colCount), type: WidthType.PERCENTAGE },
          }),
        );
      }

      rows.push(new TableRow({ children: cells }));
    }

    return new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableOuterBorders,
    });
  };

  const createTagTable = (
    items: SectionItem[],
    options: {
      columns: number;
      fill: string;
      text: string;
      size?: number;
      align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    },
  ) => {
    const rows = [];
    for (let index = 0; index < items.length; index += options.columns) {
      const rowItems = items.slice(index, index + options.columns);
      const cells = rowItems.map(
        (item) =>
          new TableCell({
            children: [
              paragraph(
                [run(item.title, { color: options.text, size: options.size ?? 20, bold: true })],
                {
                  alignment: options.align ?? AlignmentType.CENTER,
                  spacing: { after: 40 },
                },
              ),
            ],
            shading: {
              fill: options.fill,
              type: ShadingType.CLEAR,
              color: "auto",
            },
            borders: cellBorders,
            width: {
              size: Math.floor(100 / options.columns),
              type: WidthType.PERCENTAGE,
            },
            margins: {
              top: 80,
              bottom: 80,
              left: 100,
              right: 100,
            },
          }),
      );

      while (cells.length < options.columns) {
        cells.push(
          new TableCell({
            children: [new Paragraph({})],
            borders: cellBorders,
            width: {
              size: Math.floor(100 / options.columns),
              type: WidthType.PERCENTAGE,
            },
          }),
        );
      }

      rows.push(new TableRow({ children: cells }));
    }

    return new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableOuterBorders,
    });
  };

  const createHeaderLinks = (linkColor: string, center: boolean = false) => {
    const linkParts: any[] = [];

    if (personalInfo.linkedin) {
      linkParts.push(
        hyperlink(labels.linkedin, normalizeLinkedInUrl(personalInfo.linkedin), {
          color: linkColor,
          size: 20,
          font: center ? headingFont : bodyFont,
        }),
      );
    }
    if (personalInfo.github) {
      linkParts.push(
        hyperlink(labels.github, normalizeGitHubUrl(personalInfo.github), {
          color: linkColor,
          size: 20,
          font: center ? headingFont : bodyFont,
        }),
      );
    }
    if (personalInfo.website) {
      linkParts.push(
        hyperlink(
          personalInfo.website,
          normalizeWebsiteUrl(personalInfo.website),
          {
            color: linkColor,
            size: 20,
            font: center ? headingFont : bodyFont,
          },
        ),
      );
    }

    return linkParts.length > 0
      ? paragraph(joinInline(linkParts), {
          alignment: center ? AlignmentType.CENTER : alignmentStart,
          spacing: { after: template === "creative" ? 120 : 240 },
        })
      : null;
  };

  const buildSummarySection = (summaryTitle: string, children: any[]) => {
    if (!personalInfo.summary) return;

    if (template === "classic") {
      children.push(
        paragraph(
          [run(summaryTitle, { bold: true, allCaps: true, font: headingFont, size: 20 })],
          {
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 4, color: borderGray },
            },
          },
        ),
      );
      children.push(
        paragraph([run(personalInfo.summary, { size: 20 })], {
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: sectionGap },
        }),
      );
      return;
    }

    children.push(
      paragraph(
        [
          run(summaryTitle, {
            bold: true,
            allCaps: true,
            font: headingFont,
            size: template === "creative" ? 24 : 18,
            color: template === "creative" ? textColor : accentColor,
          }),
        ],
        {
          spacing: { before: 80, after: 120 },
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: template === "creative" ? 10 : 6,
              color: accentColor,
            },
          },
        },
      ),
    );
    children.push(
      paragraph([run(personalInfo.summary, { size: 20, color: mutedColor })], {
        alignment: template === "creative" ? alignmentStart : AlignmentType.JUSTIFIED,
        spacing: { after: sectionGap },
      }),
    );
  };

  const createSectionHeading = (
    title: string,
    options: {
      color?: string;
      sidebar?: boolean;
    } = {},
  ) => {
    if (template === "classic" && !options.sidebar) {
      return new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  paragraph(
                    [
                      run(title.charAt(0).toUpperCase(), {
                        bold: true,
                        color: "FFFFFF",
                        font: headingFont,
                        size: 18,
                      }),
                    ],
                    {
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 0 },
                    },
                  ),
                ],
                shading: {
                  fill: accentColor,
                  type: ShadingType.CLEAR,
                  color: "auto",
                },
                borders: cellBorders,
                width: { size: 8, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [
                  paragraph(
                    [
                      run(title.toUpperCase(), {
                        bold: true,
                        font: headingFont,
                        size: 22,
                      }),
                    ],
                    {
                      spacing: { after: 40 },
                    },
                  ),
                ],
                borders: cellBorders,
                width: { size: 92, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableOuterBorders,
      });
    }

    return paragraph(
      [
        run(title.toUpperCase(), {
          bold: true,
          font: headingFont,
          size: options.sidebar ? 18 : template === "creative" ? 24 : 18,
          color: options.color ?? (options.sidebar ? "FFFFFF" : accentColor),
        }),
      ],
      {
        spacing: { before: 120, after: options.sidebar ? 100 : 120 },
        border: {
          [options.sidebar ? "top" : "bottom"]: {
            style: BorderStyle.SINGLE,
            size: options.sidebar ? 4 : template === "creative" ? 10 : 6,
            color: options.sidebar ? "FFFFFF" : accentColor,
          },
        },
      },
    );
  };

  const createSkillOrLanguageContent = (
    section: ResumeSection,
    options: {
      textColor: string;
      secondaryColor: string;
      indicatorColor: string;
      tagFill: string;
      sidebar?: boolean;
    },
  ) => {
    const items = filterVisibleItems(section.items);
    if (items.length === 0) return [];

    if (section.type === "skills") {
      const skillsStyle = metadata?.skillsDisplayStyle || "tags";
      if (skillsStyle === "tags") {
        return [
          createTagTable(items, {
            columns: options.sidebar ? 1 : 3,
            fill: options.tagFill,
            text: options.textColor,
            align: options.sidebar ? alignmentStart : AlignmentType.CENTER,
          }),
        ];
      }

      const visualStyle =
        skillsStyle === "dots"
          ? "dots"
          : skillsStyle === "bar"
            ? "bar"
            : "text";

      return items.map((item) =>
        paragraph(
          [
            run(`${item.title}  `, {
              bold: true,
              color: options.textColor,
              size: 20,
            }),
            ...createRatingRuns(
              item.level || parseLevel(item.subtitle),
              visualStyle,
              options.indicatorColor,
              options.secondaryColor,
              options.secondaryColor,
            ),
          ],
          {
            spacing: { after: 80 },
          },
        ),
      );
    }

    const languagesStyle = metadata?.languagesDisplayStyle || "level";
    const visualStyle =
      languagesStyle === "dots"
        ? "dots"
        : languagesStyle === "bar"
          ? "bar"
          : "text";

    return items.map((item) =>
      paragraph(
        [
          run(`${item.title}  `, {
            bold: true,
            color: options.textColor,
            size: 20,
          }),
          ...createRatingRuns(
            item.level || parseLevel(item.subtitle),
            visualStyle,
            options.indicatorColor,
            options.secondaryColor,
            options.secondaryColor,
          ),
        ],
        {
          spacing: { after: 80 },
        },
      ),
    );
  };

  const createStandardItemContent = (item: SectionItem) => {
    const meta = [item.date, item.location].filter(Boolean).join(" | ");
    const descriptionLines = splitDescriptionLines(item.description);

    if (template === "creative") {
      const blockChildren: any[] = [];

      blockChildren.push(
        paragraph(
          [
            run(item.subtitle || item.title, {
              bold: true,
              size: 24,
              font: headingFont,
            }),
          ],
          { spacing: { after: 40 } },
        ),
      );

      if (item.subtitle && item.subtitle !== item.title) {
        blockChildren.push(
          paragraph(
            [run(item.title, { bold: true, color: mutedColor, size: 20 })],
            { spacing: { after: 40 } },
          ),
        );
      }

      if (meta) {
        blockChildren.push(
          paragraph(
            [run(meta.toUpperCase(), { color: subtleColor, size: 16 })],
            { spacing: { after: 70 } },
          ),
        );
      }

      descriptionLines.forEach((line) => {
        blockChildren.push(
          new Paragraph({
            children: [run(line.text, { color: mutedColor, size: 20 })],
            bullet: line.bullet ? { level: 0 } : undefined,
            spacing: { after: 60 },
            bidirectional: isRtl,
          }),
        );
      });

      return new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: blockChildren.length > 0 ? blockChildren : [new Paragraph({})],
                borders: {
                  ...cellBorders,
                  left: {
                    style: BorderStyle.SINGLE,
                    size: 12,
                    color: accentColor,
                  },
                },
                margins: {
                  top: 60,
                  bottom: 60,
                  left: 140,
                  right: 60,
                },
              }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableOuterBorders,
      });
    }

    const leftChildren: any[] = [
      paragraph(
        [run(item.title, { bold: true, size: 22, font: headingFont })],
        {
          spacing: { after: item.subtitle ? 40 : 20 },
        },
      ),
    ];

    if (item.subtitle) {
      leftChildren.push(
        paragraph(
          [run(item.subtitle, { bold: template === "modern", size: 20, color: mutedColor })],
          {
            spacing: { after: 50 },
          },
        ),
      );
    }

    descriptionLines.forEach((line) => {
      leftChildren.push(
        new Paragraph({
          children: [run(line.text, { size: 20 })],
          bullet: line.bullet ? { level: 0 } : undefined,
          spacing: { after: 60 },
          bidirectional: isRtl,
        }),
      );
    });

    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: leftChildren,
              borders: cellBorders,
              width: { size: 72, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                paragraph([run(item.date || "", { italics: true, color: mutedColor, size: 18 })], {
                  alignment: alignmentEnd,
                  spacing: { after: item.location ? 20 : 0 },
                }),
                ...(item.location
                  ? [
                      paragraph(
                        [run(item.location, { color: subtleColor, size: 18 })],
                        {
                          alignment: alignmentEnd,
                        },
                      ),
                    ]
                  : [new Paragraph({})]),
              ],
              borders: cellBorders,
              width: { size: 28, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.TOP,
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableOuterBorders,
    });
  };

  const renderSectionContent = (
    section: ResumeSection,
    container: any[],
    options: {
      textColor: string;
      secondaryColor: string;
      indicatorColor: string;
      tagFill: string;
      sidebar?: boolean;
    },
  ) => {
    const items = filterVisibleItems(section.items);
    if (items.length === 0) return;

    container.push(
      createSectionHeading(getSectionTitle(section.type, section.title), {
        color: options.sidebar ? "FFFFFF" : undefined,
        sidebar: options.sidebar,
      }),
    );

    if (section.type === "skills" || section.type === "languages") {
      container.push(...createSkillOrLanguageContent(section, options));
      container.push(new Paragraph({ spacing: { after: 120 } }));
      return;
    }

    if (shouldUseSimpleColumnsDocx(section, resumeData)) {
      container.push(
        createSimpleColumnsTable(
          items,
          getColumnCount(section, resumeData),
          options.textColor,
        ),
      );
      container.push(new Paragraph({ spacing: { after: sectionGap } }));
      return;
    }

    items.forEach((item) => {
      container.push(createStandardItemContent(item));
      container.push(new Paragraph({ spacing: { after: itemGap } }));
    });
  };

  const visibleSections = getVisibleSections(resumeData.sections);

  const buildModernChildren = () => {
    const children: any[] = [];

    children.push(
      paragraph(
        [
          run((personalInfo.fullName || "Resume").toUpperCase(), {
            bold: true,
            color: accentColor,
            size: 34,
            font: headingFont,
          }),
        ],
        {
          spacing: { after: 60 },
        },
      ),
    );

    if (personalInfo.jobTitle) {
      children.push(
        paragraph([run(personalInfo.jobTitle, { size: 24, color: mutedColor })], {
          spacing: { after: 140 },
        }),
      );
    }

    const contactParts = [
      personalInfo.email ? run(personalInfo.email, { color: mutedColor, size: 20 }) : null,
      personalInfo.phone ? run(personalInfo.phone, { color: mutedColor, size: 20 }) : null,
      personalInfo.city || personalInfo.country
        ? run(
            [personalInfo.city, personalInfo.country].filter(Boolean).join(", "),
            { color: mutedColor, size: 20 },
          )
        : null,
    ].filter(Boolean);

    if (contactParts.length > 0) {
      children.push(
        paragraph(joinInline(contactParts), {
          spacing: { after: 140 },
        }),
      );
    }

    const links = createHeaderLinks(accentColor);
    if (links) children.push(links);

    children.push(
      paragraph([], {
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 10, color: accentColor },
        },
        spacing: { after: sectionGap },
      }),
    );

    buildSummarySection(getHeader("summary", labels.profile), children);

    visibleSections.forEach((section) =>
      renderSectionContent(section, children, {
        textColor,
        secondaryColor: mutedColor,
        indicatorColor: accentColor,
        tagFill: lightGray,
      }),
    );

    return children;
  };

  const buildClassicChildren = () => {
    const children: any[] = [];

    children.push(
      paragraph(
        [
          run((personalInfo.fullName || "Resume").toUpperCase(), {
            bold: true,
            size: 30,
            font: headingFont,
          }),
        ],
        {
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          border: {
            bottom: { style: BorderStyle.DOUBLE, size: 6, color: borderGray },
          },
        },
      ),
    );

    if (personalInfo.jobTitle) {
      children.push(
        paragraph([run(personalInfo.jobTitle, { italics: true, color: mutedColor, size: 22 })], {
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
      );
    }

    const contactParts = [
      personalInfo.email ? run(personalInfo.email, { color: mutedColor, size: 20 }) : null,
      personalInfo.phone ? run(personalInfo.phone, { color: mutedColor, size: 20 }) : null,
      personalInfo.city || personalInfo.country
        ? run(
            [personalInfo.city, personalInfo.country].filter(Boolean).join(", "),
            { color: mutedColor, size: 20 },
          )
        : null,
    ].filter(Boolean);

    if (contactParts.length > 0) {
      children.push(
        paragraph(joinInline(contactParts), {
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        }),
      );
    }

    const links = createHeaderLinks(accentColor, true);
    if (links) children.push(links);

    buildSummarySection(getHeader("summary", labels.profile), children);

    visibleSections.forEach((section) =>
      renderSectionContent(section, children, {
        textColor,
        secondaryColor: mutedColor,
        indicatorColor: accentColor,
        tagFill: lightGray,
      }),
    );

    return children;
  };

  const buildCreativeChildren = () => {
    const sidebarChildren: any[] = [];
    const mainChildren: any[] = [];

    sidebarChildren.push(
      paragraph(
        [
          run((personalInfo.fullName || "Resume").toUpperCase(), {
            bold: true,
            color: "FFFFFF",
            size: 28,
            font: headingFont,
          }),
        ],
        {
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
        },
      ),
    );

    if (personalInfo.jobTitle) {
      sidebarChildren.push(
        paragraph([run(personalInfo.jobTitle, { color: "FFFFFF", size: 20 })], {
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
        }),
      );
    }

    [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.address,
      [personalInfo.city, personalInfo.country].filter(Boolean).join(", "),
    ]
      .filter(Boolean)
      .forEach((value) => {
        sidebarChildren.push(
          paragraph([run(value as string, { color: "FFFFFF", size: 18 })], {
            spacing: { after: 70 },
          }),
        );
      });

    const sidebarLinks = createHeaderLinks("FFFFFF");
    if (sidebarLinks) sidebarChildren.push(sidebarLinks);

    visibleSections
      .filter((section) => section.type === "skills" || section.type === "languages")
      .forEach((section) =>
        renderSectionContent(section, sidebarChildren, {
          textColor: "FFFFFF",
          secondaryColor: "E5E7EB",
          indicatorColor: "FFFFFF",
          tagFill: "FFFFFF",
          sidebar: true,
        }),
      );

    buildSummarySection(getHeader("summary", labels.profile), mainChildren);

    visibleSections
      .filter((section) => section.type !== "skills" && section.type !== "languages")
      .forEach((section) =>
        renderSectionContent(section, mainChildren, {
          textColor,
          secondaryColor: mutedColor,
          indicatorColor: accentColor,
          tagFill: lightGray,
        }),
      );

    return [
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: sidebarChildren,
                shading: {
                  fill: accentColor,
                  type: ShadingType.CLEAR,
                  color: "auto",
                },
                borders: cellBorders,
                width: { size: 30, type: WidthType.PERCENTAGE },
                margins: {
                  top: 220,
                  bottom: 220,
                  left: 180,
                  right: 180,
                },
                verticalAlign: VerticalAlign.TOP,
              }),
              new TableCell({
                children: mainChildren.length > 0 ? mainChildren : [new Paragraph({})],
                borders: cellBorders,
                width: { size: 70, type: WidthType.PERCENTAGE },
                margins: {
                  top: 220,
                  bottom: 220,
                  left: 220,
                  right: 220,
                },
                verticalAlign: VerticalAlign.TOP,
              }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableOuterBorders,
      }),
    ];
  };

  const children =
    template === "classic"
      ? buildClassicChildren()
      : template === "creative"
        ? buildCreativeChildren()
        : buildModernChildren();

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: pxToTwip(margins.top, 32),
              bottom: pxToTwip(margins.bottom, 32),
              left: pxToTwip(margins.left, 32),
              right: pxToTwip(margins.right, 32),
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${filename}.docx`);
}
