/**
 * Server-side HTML renderer for resume templates
 * Generates static HTML with inline CSS for Puppeteer PDF generation
 */

import type {
  ResumeData,
  SkillLevel,
  SkillsDisplayStyle,
  LanguagesDisplayStyle,
  CoursesDisplayStyle,
} from "@/features/upload-cv/types";
import {
  normalizeGitHubUrl,
  normalizeLinkedInUrl,
  normalizeWebsiteUrl,
} from "@/features/resume-builder/utils/socialLinks";

// ============================================================================
// Shared Utilities
// ============================================================================

function parseLevel(value?: string): SkillLevel {
  if (!value) return "intermediate";
  const lower = value.toLowerCase();
  if (lower === "native" || lower === "fluent" || lower === "expert")
    return "expert";
  if (lower === "advanced") return "advanced";
  if (lower === "intermediate") return "intermediate";
  if (lower === "beginner") return "beginner";
  return "intermediate";
}

const LEVEL_VALUES: Record<SkillLevel, number> = {
  expert: 5,
  advanced: 4,
  intermediate: 3,
  beginner: 2,
  none: 1,
};

function renderLevelDots(level: SkillLevel, color: string): string {
  const value = LEVEL_VALUES[level] || 3;
  const maxDots = 5;
  return `
    <div style="display: flex; gap: 4px; align-items: center;">
      ${Array.from({ length: maxDots })
        .map(
          (_, i) => `
        <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${i < value ? color : "#e5e7eb"};"></div>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderLevelBar(level: SkillLevel, color: string): string {
  const value = LEVEL_VALUES[level] || 3;
  const percentage = (value / 5) * 100;
  return `
    <div style="width: 80px; height: 8px; background-color: #e5e7eb; border-radius: 9999px; overflow: hidden;">
      <div style="height: 100%; width: ${percentage}%; background-color: ${color}; border-radius: 9999px;"></div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================================
// Base HTML Template
// ============================================================================

function wrapInHtmlDocument(
  content: string,
  direction: "ltr" | "rtl",
  bodyFontFamily: string = "Inter",
  headingFontFamily: string = "Inter",
): string {
  // ── Google Fonts registry ──
  const googleFontsMap: Record<string, string> = {
    Inter:
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">',
    Roboto:
      '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">',
    Merriweather:
      '<link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" rel="stylesheet">',
    "Fira Code":
      '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap" rel="stylesheet">',
    Lato: '<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet">',
  };

  // ── CSS fallback stacks ──
  const cssFallbacks: Record<string, string> = {
    Georgia: "Georgia, 'Times New Roman', serif",
    Merriweather: "'Merriweather', Georgia, serif",
    "Fira Code": "'Fira Code', 'Courier New', monospace",
  };
  const defaultStack =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const fontLinks: string[] = [];
  const fontsToLoad = new Set([bodyFontFamily, headingFontFamily]);
  for (const font of fontsToLoad) {
    if (googleFontsMap[font]) fontLinks.push(googleFontsMap[font]);
  }

  const toCss = (font: string) =>
    cssFallbacks[font] || `'${font}', ${defaultStack}`;

  const bodyFontFamilyCss = toCss(bodyFontFamily);
  const headingFontFamilyCss = toCss(headingFontFamily);

  return `
<!DOCTYPE html>
<html lang="en" dir="${direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${fontLinks.join("\n  ")}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ${bodyFontFamilyCss};
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: ${headingFontFamilyCss};
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>
  `.trim();
}

// ============================================================================
// Classic Template
// ============================================================================

function renderClassicTemplate(data: ResumeData, color: string): string {
  const { personalInfo, sections, metadata } = data;
  const skillsStyle: SkillsDisplayStyle =
    metadata?.skillsDisplayStyle || "tags";
  const languagesStyle: LanguagesDisplayStyle =
    metadata?.languagesDisplayStyle || "level";
  const coursesStyle: CoursesDisplayStyle =
    metadata?.coursesDisplayStyle || "simple";

  const direction =
    metadata?.layoutDirection === "ltr"
      ? "ltr"
      : metadata?.layoutDirection === "rtl"
        ? "rtl"
        : metadata?.language === "ar"
          ? "rtl"
          : "ltr";

  const labels = {
    summary: metadata?.language === "ar" ? "الملخص" : "Summary",
    linkedin: metadata?.language === "ar" ? "لينكد إن" : "LinkedIn",
    github: metadata?.language === "ar" ? "جيت هب" : "GitHub",
  };

  const visibleSections = sections.filter(
    (s) =>
      s.visible !== false &&
      s.items &&
      s.items.some((i: any) => i.visible !== false),
  );

  const compactClass = metadata?.compactMode ? "1.2" : "1.6";
  const margins = metadata?.margins || {
    top: 40,
    bottom: 40,
    left: 40,
    right: 40,
  };
  const spacingLevel = metadata?.spacingLevel ?? 3;
  const sectionMargin = spacingLevel * 8; // e.g. 24px
  const itemGap = spacingLevel * 4; // e.g. 12px

  const renderSkills = (section: (typeof sections)[0]) => {
    const items = section.items.filter((item) => item.visible !== false);
    if (skillsStyle === "tags") {
      return `
        <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 14px;">
          ${items
            .map(
              (item) => `
            <span style="display: inline-block; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; margin-right: 4px; margin-bottom: 4px;">
              ${escapeHtml(item.title)}
            </span>
          `,
            )
            .join("")}
        </div>
      `;
    }
    const displayStyle =
      skillsStyle === "dots" ? "dots" : skillsStyle === "bar" ? "bar" : "text";
    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 32px;">
        ${items
          .map((item) => {
            const level = item.level || parseLevel(item.subtitle);
            return `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 14px; color: #1f2937;">${escapeHtml(item.title)}</span>
              ${displayStyle === "dots" ? renderLevelDots(level, color) : displayStyle === "bar" ? renderLevelBar(level, color) : `<span style="font-size: 14px; color: #6b7280; font-style: italic;">${level}</span>`}
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  };

  const renderLanguages = (section: (typeof sections)[0]) => {
    const items = section.items.filter((item) => item.visible !== false);
    if (languagesStyle === "level") {
      return `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${items
            .map(
              (item) => `
            <div style="font-size: 14px;">
              <span style="font-weight: 700; color: #1f2937;">${escapeHtml(item.title)}</span>
              ${item.subtitle ? `<span style="color: #4b5563;"> - ${escapeHtml(item.subtitle)}</span>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    }
    const displayStyle = languagesStyle === "dots" ? "dots" : "bar";
    return `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${items
          .map((item) => {
            const level = item.level || parseLevel(item.subtitle);
            return `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 14px; font-weight: 700; color: #1f2937;">${escapeHtml(item.title)}</span>
              ${displayStyle === "dots" ? renderLevelDots(level, color) : renderLevelBar(level, color)}
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  };

  const renderSimpleCourses = (section: (typeof sections)[0]) => {
    const items = section.items.filter((item) => item.visible !== false);
    const columnCount = metadata?.sectionColumns?.[section.id] ?? 3;
    const itemsPerColumn = Math.ceil(items.length / columnCount);
    const columns: (typeof items)[] = [];
    for (let i = 0; i < columnCount; i++) {
      columns.push(items.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
    }

    return `
      <div style="display: grid; grid-template-columns: repeat(${columnCount}, minmax(0, 1fr)); gap: 16px; font-size: 14px;">
        ${columns
          .map(
            (column) => `
          <ul style="list-style-type: disc; list-style-position: inside; display: flex; flex-direction: column; gap: 4px;">
            ${column.map((item) => `<li style="color: #374151;">${escapeHtml(item.title)}</li>`).join("")}
          </ul>
        `,
          )
          .join("")}
      </div>
    `;
  };

  const isCertOrCourse = (type: string, title: string) => {
    const lowerTitle = title.toLowerCase();
    return (
      type === "certifications" ||
      lowerTitle.includes("course") ||
      lowerTitle.includes("certif")
    );
  };

  const isSimpleListSection = (type: string, title: string) => {
    const lowerTitle = title.toLowerCase();
    return (
      type === "interests" ||
      lowerTitle.includes("interest") ||
      lowerTitle.includes("hobby") ||
      lowerTitle.includes("hobbies")
    );
  };

  const shouldUseSimpleColumns = (section: any) => {
    if (section.type === "skills" || section.type === "languages") return false;
    if (
      isCertOrCourse(section.type, section.title) &&
      coursesStyle === "simple"
    )
      return true;
    if (isSimpleListSection(section.type, section.title)) return true;
    if (metadata?.sectionColumns?.[section.id]) return true;
    return false;
  };

  const content = `
    <div style="padding: ${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px; min-height: 100%; background-color: white; color: #111827; line-height: ${compactClass};">
      <header style="text-align: center; margin-bottom: ${sectionMargin}px; border-bottom: 4px double #d1d5db; padding-bottom: 24px;">
        <h1 style="font-size: 30px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em; color: #111827;">
          ${escapeHtml(personalInfo.fullName)}
        </h1>
        <div style="color: #4b5563; font-style: italic; margin-bottom: 12px;">${escapeHtml(personalInfo.jobTitle || "")}</div>
        <div style="font-size: 14px; color: #4b5563; display: flex; flex-wrap: wrap; justify-content: center; gap: 16px;">
          ${personalInfo.email ? `<span>${escapeHtml(personalInfo.email)}</span>` : ""}
          ${personalInfo.phone ? `<span>• ${escapeHtml(personalInfo.phone)}</span>` : ""}
          ${personalInfo.city ? `<span>• ${escapeHtml([personalInfo.city, personalInfo.country].filter(Boolean).join(", "))}</span>` : ""}
        </div>
        <div style="font-size: 14px; color: #4b5563; display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-top: 4px;">
          ${personalInfo.linkedin ? `<a href="${escapeHtml(normalizeLinkedInUrl(personalInfo.linkedin))}" target="_blank">${labels.linkedin}</a>` : ""}
          ${personalInfo.github ? `<a href="${escapeHtml(normalizeGitHubUrl(personalInfo.github))}" target="_blank">${labels.github}</a>` : ""}
          ${personalInfo.website ? `<a href="${escapeHtml(normalizeWebsiteUrl(personalInfo.website))}" target="_blank">${escapeHtml(personalInfo.website)}</a>` : ""}
        </div>
      </header>

      ${
        personalInfo.summary
          ? `
        <section style="margin-bottom: ${sectionMargin}px; text-align: center; max-width: 672px; margin-left: auto; margin-right: auto;">
          <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #d1d5db; display: inline-block; padding: 0 16px;">${labels.summary}</h3>
          <p style="font-size: 14px; text-align: justify;">${escapeHtml(personalInfo.summary)}</p>
        </section>
      `
          : ""
      }

      ${visibleSections
        .map(
          (section) => `
        <section style="margin-bottom: ${sectionMargin}px;">
          <h3 style="font-size: 18px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #1f2937; margin-bottom: 16px; display: flex; align-items: center;">
            <span style="background-color: ${color}; color: white; padding: 2px 8px; font-size: 14px; margin-right: 8px;">
              ${section.title.charAt(0)}
            </span>
            ${escapeHtml(section.title)}
          </h3>

          ${
            section.type === "skills"
              ? renderSkills(section)
              : section.type === "languages"
                ? renderLanguages(section)
                : shouldUseSimpleColumns(section)
                  ? renderSimpleCourses(section)
                  : `
              <div style="display: flex; flex-direction: column; gap: 16px;">
                ${section.items
                  .filter((i) => i.visible !== false)
                  .map(
                    (item) => `
                  <div>
                    <div style="display: flex; justify-content: space-between; font-weight: 700; color: #1f2937; font-size: 14px;">
                      <span>${escapeHtml(item.title)}</span>
                      <span>${escapeHtml(item.date || "")}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; color: #4b5563; font-style: italic; font-size: 14px; margin-bottom: 4px;">
                      <span>${escapeHtml(item.subtitle || "")}</span>
                      <span>${escapeHtml(item.location || "")}</span>
                    </div>
                    ${item.description ? `<div style="font-size: 14px; color: #374151; white-space: pre-wrap;">${escapeHtml(item.description)}</div>` : ""}
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
          }
        </section>
      `,
        )
        .join("")}
    </div>
  `;

  const bodyFontFamily =
    metadata?.bodyFontFamily || metadata?.fontFamily || "Inter";
  const headingFontFamily =
    metadata?.headingFontFamily || metadata?.fontFamily || "Inter";
  return wrapInHtmlDocument(
    content,
    direction,
    bodyFontFamily,
    headingFontFamily,
  );
}

// ============================================================================
// Modern Template
// ============================================================================

function renderModernTemplate(data: ResumeData, color: string): string {
  const { personalInfo, sections, metadata } = data;
  const skillsStyle: SkillsDisplayStyle =
    metadata?.skillsDisplayStyle || "tags";
  const languagesStyle: LanguagesDisplayStyle =
    metadata?.languagesDisplayStyle || "level";
  const coursesStyle: CoursesDisplayStyle =
    metadata?.coursesDisplayStyle || "simple";

  const direction =
    metadata?.layoutDirection === "ltr"
      ? "ltr"
      : metadata?.layoutDirection === "rtl"
        ? "rtl"
        : metadata?.language === "ar"
          ? "rtl"
          : "ltr";

  const isRtl = direction === "rtl";

  const labels = {
    summary:
      metadata?.language === "ar" ? "الملخص المهني" : "Professional Summary",
    linkedin: metadata?.language === "ar" ? "لينكد إن" : "LinkedIn",
    github: metadata?.language === "ar" ? "جيت هب" : "GitHub",
  };

  const visibleSections = sections.filter(
    (s) => s.visible !== false && s.items && s.items.length > 0,
  );

  const compactClass = metadata?.compactMode ? "1.2" : "1.6";
  const margins = metadata?.margins || {
    top: 32,
    bottom: 32,
    left: 32,
    right: 32,
  };
  const spacingLevel = metadata?.spacingLevel ?? 3;
  const sectionMargin = spacingLevel * 8; // e.g. 24px
  const itemGap = spacingLevel * 4; // e.g. 16px

  const renderSkills = (section: (typeof sections)[0]) => {
    const items = section.items.filter((item) => item.visible !== false);
    if (skillsStyle === "tags") {
      return `
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${items
            .map(
              (item) => `
            <span style="font-size: 14px; padding: 4px 12px; background-color: #f3f4f6; border-radius: 9999px; color: #374151; font-weight: 500;">
              ${escapeHtml(item.title)}
            </span>
          `,
            )
            .join("")}
        </div>
      `;
    }
    const displayStyle =
      skillsStyle === "dots" ? "dots" : skillsStyle === "bar" ? "bar" : "text";
    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 32px;">
        ${items
          .map((item) => {
            const level = item.level || parseLevel(item.subtitle);
            return `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 14px; color: #1f2937;">${escapeHtml(item.title)}</span>
              ${displayStyle === "dots" ? renderLevelDots(level, color) : displayStyle === "bar" ? renderLevelBar(level, color) : `<span style="font-size: 14px; color: #6b7280; font-style: italic;">${level}</span>`}
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  };

  const renderLanguages = (section: (typeof sections)[0]) => {
    const items = section.items.filter((item) => item.visible !== false);
    if (languagesStyle === "level") {
      return `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${items
            .map(
              (item) => `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 14px; font-weight: 500; color: #1f2937;">${escapeHtml(item.title)}</span>
              <span style="font-size: 14px; color: #4b5563; font-style: italic; text-transform: capitalize;">${escapeHtml(item.subtitle || "Intermediate")}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    }
    const displayStyle = languagesStyle === "dots" ? "dots" : "bar";
    return `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${items
          .map((item) => {
            const level = item.level || parseLevel(item.subtitle);
            return `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 14px; font-weight: 500; color: #1f2937;">${escapeHtml(item.title)}</span>
              ${displayStyle === "dots" ? renderLevelDots(level, color) : renderLevelBar(level, color)}
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  };

  const renderSimpleCourses = (section: (typeof sections)[0]) => {
    const items = section.items.filter((item) => item.visible !== false);
    const columnCount = metadata?.sectionColumns?.[section.id] ?? 3;
    const itemsPerColumn = Math.ceil(items.length / columnCount);
    const columns: (typeof items)[] = [];
    for (let i = 0; i < columnCount; i++) {
      columns.push(items.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
    }

    return `
      <div style="display: grid; grid-template-columns: repeat(${columnCount}, minmax(0, 1fr)); gap: 16px; font-size: 14px;">
        ${columns
          .map(
            (column) => `
          <ul style="list-style-type: disc; list-style-position: inside; display: flex; flex-direction: column; gap: 4px;">
            ${column.map((item) => `<li style="color: #374151;">${escapeHtml(item.title)}</li>`).join("")}
          </ul>
        `,
          )
          .join("")}
      </div>
    `;
  };

  const shouldUseSimpleColumns = (section: any) => {
    if (section.type === "skills" || section.type === "languages") return false;
    const lowerTitle = section.title.toLowerCase();
    const isCourse =
      section.type === "certifications" ||
      lowerTitle.includes("course") ||
      lowerTitle.includes("certif");
    const isSimpleList =
      lowerTitle.includes("interest") || lowerTitle.includes("hobb");
    return isSimpleList || (isCourse && coursesStyle === "simple");
  };

  // SVG icons for Modern template
  const mailIcon = `<svg style="width: 12px; height: 12px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
  const phoneIcon = `<svg style="width: 12px; height: 12px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
  const mapPinIcon = `<svg style="width: 12px; height: 12px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
  const linkedinIcon = `<svg style="width: 12px; height: 12px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;
  const githubIcon = `<svg style="width: 12px; height: 12px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
  const globeIcon = `<svg style="width: 12px; height: 12px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;

  const content = `
    <div style="padding: ${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px; min-height: 100%; background-color: white; color: #111827;">
      <!-- Header -->
      <header style="border-bottom: 2px solid ${color}; padding-bottom: 24px; margin-bottom: ${sectionMargin}px;">
        <h1 style="font-size: 36px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.025em; margin-bottom: 8px; color: ${color};">
          ${escapeHtml(personalInfo.fullName)}
        </h1>
        <p style="font-size: 18px; color: #4b5563; margin-bottom: 16px;">${escapeHtml(personalInfo.jobTitle || "")}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 14px; color: #4b5563;">
          ${personalInfo.email ? `<div style="display: flex; align-items: center; gap: 4px;">${mailIcon} ${escapeHtml(personalInfo.email)}</div>` : ""}
          ${personalInfo.phone ? `<div style="display: flex; align-items: center; gap: 4px;">${phoneIcon} ${escapeHtml(personalInfo.phone)}</div>` : ""}
          ${personalInfo.city ? `<div style="display: flex; align-items: center; gap: 4px;">${mapPinIcon} ${escapeHtml([personalInfo.city, personalInfo.country].filter(Boolean).join(", "))}</div>` : ""}
          ${personalInfo.linkedin ? `<a href="${escapeHtml(normalizeLinkedInUrl(personalInfo.linkedin))}" target="_blank" style="display: flex; align-items: center; gap: 4px; color: #2563eb;">${linkedinIcon} ${labels.linkedin}</a>` : ""}
          ${personalInfo.github ? `<a href="${escapeHtml(normalizeGitHubUrl(personalInfo.github))}" target="_blank" style="display: flex; align-items: center; gap: 4px; color: #2563eb;">${githubIcon} ${labels.github}</a>` : ""}
          ${personalInfo.website ? `<a href="${escapeHtml(normalizeWebsiteUrl(personalInfo.website))}" target="_blank" style="display: flex; align-items: center; gap: 4px; color: #2563eb;">${globeIcon} ${escapeHtml(personalInfo.website)}</a>` : ""}
        </div>
      </header>

      <!-- Summary -->
      ${
        personalInfo.summary
          ? `
        <section style="margin-bottom: ${sectionMargin}px;">
          <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; border-bottom: 1px solid ${color}40; padding-bottom: 4px; color: ${color};">
            ${labels.summary}
          </h3>
          <p style="font-size: 14px; color: #374151; line-height: 1.6; text-align: justify;">${escapeHtml(personalInfo.summary)}</p>
        </section>
      `
          : ""
      }

      <!-- Dynamic Sections -->
      ${visibleSections
        .map(
          (section) => `
        <section style="margin-bottom: ${sectionMargin}px;">
          <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; border-bottom: 1px solid ${color}40; padding-bottom: 4px; color: ${color};">
            ${escapeHtml(section.title)}
          </h3>
          
          ${
            section.type === "skills"
              ? renderSkills(section)
              : section.type === "languages"
                ? renderLanguages(section)
                : shouldUseSimpleColumns(section)
                  ? renderSimpleCourses(section)
                  : `
              <div style="display: flex; flex-direction: column; gap: ${itemGap}px;">
                ${section.items
                  .filter((i) => i.visible !== false)
                  .map(
                    (item) => `
                  <div style="page-break-inside: avoid;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                      <h4 style="font-weight: 700; color: #1f2937;">${escapeHtml(item.title)}</h4>
                      <span style="font-size: 14px; color: #4b5563; font-style: italic;">
                        ${escapeHtml([item.date, item.location].filter(Boolean).join(" | "))}
                      </span>
                    </div>
                    ${item.subtitle ? `<div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 4px;">${escapeHtml(item.subtitle)}</div>` : ""}
                    ${item.description ? `<div style="font-size: 14px; color: #4b5563; white-space: pre-wrap; line-height: 1.4; text-align: ${isRtl ? "right" : "justify"};">${escapeHtml(item.description)}</div>` : ""}
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
          }
        </section>
      `,
        )
        .join("")}
    </div>
  `;

  const bodyFontFamily =
    metadata?.bodyFontFamily || metadata?.fontFamily || "Inter";
  const headingFontFamily =
    metadata?.headingFontFamily || metadata?.fontFamily || "Inter";
  return wrapInHtmlDocument(
    content,
    direction,
    bodyFontFamily,
    headingFontFamily,
  );
}

// ============================================================================
// Creative Template
// ============================================================================

function renderCreativeTemplate(data: ResumeData, color: string): string {
  const { personalInfo, sections, metadata } = data;
  const skillsStyle: SkillsDisplayStyle =
    metadata?.skillsDisplayStyle || "tags";
  const languagesStyle: LanguagesDisplayStyle =
    metadata?.languagesDisplayStyle || "level";
  const coursesStyle: CoursesDisplayStyle =
    metadata?.coursesDisplayStyle || "simple";

  const direction =
    metadata?.layoutDirection === "ltr"
      ? "ltr"
      : metadata?.layoutDirection === "rtl"
        ? "rtl"
        : metadata?.language === "ar"
          ? "rtl"
          : "ltr";

  const labels = {
    profile: metadata?.language === "ar" ? "الملف الشخصي" : "Profile",
    linkedin: metadata?.language === "ar" ? "لينكد إن" : "LinkedIn",
    github: metadata?.language === "ar" ? "جيت هب" : "GitHub",
  };

  const skillsSections = sections.filter(
    (s) =>
      s.visible !== false &&
      s.type === "skills" &&
      s.items &&
      s.items.some((i) => i.visible !== false),
  );
  const languagesSections = sections.filter(
    (s) =>
      s.visible !== false &&
      s.type === "languages" &&
      s.items &&
      s.items.some((i) => i.visible !== false),
  );
  const otherSections = sections.filter(
    (s) =>
      s.type !== "skills" &&
      s.type !== "languages" &&
      s.visible !== false &&
      s.items &&
      s.items.length > 0,
  );

  const compactClass = metadata?.compactMode ? "1.2" : "1.6";
  const margins = metadata?.margins || {
    top: 32,
    bottom: 32,
    left: 32,
    right: 32,
  };
  const spacingLevel = metadata?.spacingLevel ?? 3;
  const sectionMargin = spacingLevel * 8; // e.g. 24px
  const itemGap = spacingLevel * 6; // e.g. 18px

  const renderSkills = (section: (typeof sections)[0]) => {
    const items = section.items.filter((item) => item.visible !== false);
    if (skillsStyle === "tags") {
      return `
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${items
            .map(
              (item) => `
            <span style="background-color: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${escapeHtml(item.title)}
            </span>
          `,
            )
            .join("")}
        </div>
      `;
    }
    const displayStyle =
      skillsStyle === "dots" ? "dots" : skillsStyle === "bar" ? "bar" : "text";
    return `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${items
          .map((item) => {
            const level = item.level || parseLevel(item.subtitle);
            return `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 12px;">${escapeHtml(item.title)}</span>
              ${displayStyle === "dots" ? renderLevelDots(level, "#ffffff") : displayStyle === "bar" ? renderLevelBar(level, "#ffffff") : `<span style="font-size: 12px; opacity: 0.8;">${level}</span>`}
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  };

  const renderLanguages = (section: (typeof sections)[0]) => {
    const items = section.items.filter((item) => item.visible !== false);
    if (languagesStyle === "level") {
      return `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${items
            .map(
              (item) => `
            <div style="font-size: 12px;">
              <span style="font-weight: 500;">${escapeHtml(item.title)}</span>
              ${item.subtitle ? `<span style="opacity: 0.8;"> - ${escapeHtml(item.subtitle)}</span>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    }
    const displayStyle = languagesStyle === "dots" ? "dots" : "bar";
    return `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${items
          .map((item) => {
            const level = item.level || parseLevel(item.subtitle);
            return `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 12px;">${escapeHtml(item.title)}</span>
              ${displayStyle === "dots" ? renderLevelDots(level, "#ffffff") : renderLevelBar(level, "#ffffff")}
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  };

  const renderSimpleCourses = (section: (typeof sections)[0]) => {
    const items = section.items.filter((item) => item.visible !== false);
    const columnCount = metadata?.sectionColumns?.[section.id] ?? 3;
    const itemsPerColumn = Math.ceil(items.length / columnCount);
    const columns: (typeof items)[] = [];
    for (let i = 0; i < columnCount; i++) {
      columns.push(items.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
    }

    return `
      <div style="display: grid; grid-template-columns: repeat(${columnCount}, minmax(0, 1fr)); gap: 16px; font-size: 14px;">
        ${columns
          .map(
            (column) => `
          <ul style="list-style-type: disc; list-style-position: inside; display: flex; flex-direction: column; gap: 4px;">
            ${column.map((item) => `<li style="color: #374151;">${escapeHtml(item.title)}</li>`).join("")}
          </ul>
        `,
          )
          .join("")}
      </div>
    `;
  };

  const shouldUseSimpleColumns = (section: any) => {
    if (section.type === "skills" || section.type === "languages") return false;
    const lowerTitle = section.title.toLowerCase();
    const isCourse =
      section.type === "certifications" ||
      lowerTitle.includes("course") ||
      lowerTitle.includes("certif");
    const isSimpleList =
      lowerTitle.includes("interest") || lowerTitle.includes("hobb");
    return isSimpleList || (isCourse && coursesStyle === "simple");
  };

  const content = `
    <div style="display: flex; min-height: 100%; background-color: white; line-height: ${compactClass};">
      <!-- Left Sidebar -->
      <aside style="width: 30%; background-color: ${color}; color: white; padding: ${margins.top}px 24px ${margins.bottom}px ${margins.left}px; display: flex; flex-direction: column; gap: ${sectionMargin}px;">
        <div style="text-align: center;">
          ${
            personalInfo.picture
              ? `<img src="${personalInfo.picture}" alt="${escapeHtml(personalInfo.fullName)}" style="width: 128px; height: 128px; border-radius: 50%; margin: 0 auto 16px; object-fit: cover; border: 4px solid rgba(255,255,255,0.3); display: block;" />`
              : `<div style="width: 128px; height: 128px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700;">${personalInfo.fullName.charAt(0)}</div>`
          }
          <h1 style="font-size: 24px; font-weight: 700; text-transform: uppercase; line-height: 1.2; margin-bottom: 8px;">
            ${escapeHtml(personalInfo.fullName)}
          </h1>
          <p style="opacity: 0.8; font-weight: 500;">${escapeHtml(personalInfo.jobTitle || "")}</p>
        </div>

        <div style="font-size: 14px; display: flex; flex-direction: column; gap: 12px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2);">
          ${personalInfo.email ? `<div style="word-break: break-word;">${escapeHtml(personalInfo.email)}</div>` : ""}
          ${personalInfo.phone ? `<div>${escapeHtml(personalInfo.phone)}</div>` : ""}
          ${personalInfo.address ? `<div>${escapeHtml(personalInfo.address)}</div>` : ""}
          ${personalInfo.linkedin ? `<a href="${escapeHtml(normalizeLinkedInUrl(personalInfo.linkedin))}" target="_blank" style="display: block; color: rgba(255,255,255,0.9); text-decoration: underline;">${labels.linkedin}</a>` : ""}
          ${personalInfo.github ? `<a href="${escapeHtml(normalizeGitHubUrl(personalInfo.github))}" target="_blank" style="display: block; color: rgba(255,255,255,0.9); text-decoration: underline;">${labels.github}</a>` : ""}
          ${personalInfo.website ? `<a href="${escapeHtml(normalizeWebsiteUrl(personalInfo.website))}" target="_blank" style="display: block; color: rgba(255,255,255,0.9); text-decoration: underline; word-break: break-word;">${escapeHtml(personalInfo.website)}</a>` : ""}
        </div>

        ${skillsSections
          .map(
            (section) => `
          <div style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2);">
            <h3 style="font-weight: 700; text-transform: uppercase; margin-bottom: 12px; opacity: 0.9;">${escapeHtml(section.title)}</h3>
            ${renderSkills(section)}
          </div>
        `,
          )
          .join("")}

        ${languagesSections
          .map(
            (section) => `
          <div style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2);">
            <h3 style="font-weight: 700; text-transform: uppercase; margin-bottom: 12px; opacity: 0.9;">${escapeHtml(section.title)}</h3>
            ${renderLanguages(section)}
          </div>
        `,
          )
          .join("")}
      </aside>

      <!-- Main Content -->
      <main style="flex: 1; padding: ${margins.top}px ${margins.right}px ${margins.bottom}px 32px; color: #1f2937;">
        ${
          personalInfo.summary
            ? `
          <section style="margin-bottom: ${sectionMargin}px;">
            <h2 style="font-size: 20px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; color: #111827; border-bottom: 2px solid ${color}; padding-bottom: 4px;">${labels.profile}</h2>
            <p style="color: #4b5563; font-size: 14px;">${escapeHtml(personalInfo.summary)}</p>
          </section>
        `
            : ""
        }

        ${otherSections
          .map(
            (section) => `
          <section style="margin-bottom: ${sectionMargin}px;">
            <h2 style="font-size: 20px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; color: #111827; border-bottom: 2px solid ${color}; padding-bottom: 4px;">
              ${escapeHtml(section.title)}
            </h2>
            
            ${
              shouldUseSimpleColumns(section)
                ? renderSimpleCourses(section)
                : `
              <div style="display: flex; flex-direction: column; gap: ${itemGap}px;">
                ${section.items
                  .filter((i) => i.visible !== false)
                  .map(
                    (item) => `
                  <div style="position: relative; padding-left: 16px; border-left: 2px solid #e5e7eb;">
                    <div style="position: absolute; left: -5px; top: 6px; width: 8px; height: 8px; border-radius: 50%; background-color: ${color};"></div>
                    <h3 style="font-weight: 700; color: #1f2937; font-size: 18px;">${escapeHtml(item.subtitle || "")}</h3>
                    <div style="font-size: 14px; font-weight: 600; color: #4b5563; margin-bottom: 4px;">${escapeHtml(item.title)}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
                      ${escapeHtml([item.date, item.location].filter(Boolean).join(" | "))}
                    </div>
                    ${item.description ? `<p style="font-size: 14px; color: #4b5563; white-space: pre-wrap;">${escapeHtml(item.description)}</p>` : ""}
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
            }
          </section>
        `,
          )
          .join("")}
      </main>
    </div>
  `;

  const bodyFontFamily =
    metadata?.bodyFontFamily || metadata?.fontFamily || "Inter";
  const headingFontFamily =
    metadata?.headingFontFamily || metadata?.fontFamily || "Inter";
  return wrapInHtmlDocument(
    content,
    direction,
    bodyFontFamily,
    headingFontFamily,
  );
}

// ============================================================================
// Executive Template — Polished, corporate, serif-flavored, subtle color accents
// ============================================================================

function renderExecutiveTemplate(data: ResumeData, color: string): string {
  const { personalInfo, sections, metadata } = data;
  const skillsStyle: SkillsDisplayStyle =
    metadata?.skillsDisplayStyle || "tags";
  const languagesStyle: LanguagesDisplayStyle =
    metadata?.languagesDisplayStyle || "level";
  const coursesStyle: CoursesDisplayStyle =
    metadata?.coursesDisplayStyle || "simple";

  const direction =
    metadata?.layoutDirection === "ltr"
      ? "ltr"
      : metadata?.layoutDirection === "rtl"
        ? "rtl"
        : metadata?.language === "ar"
          ? "rtl"
          : "ltr";

  const visibleSections = sections.filter(
    (s) =>
      s.visible !== false &&
      s.items &&
      s.items.some((i: any) => i.visible !== false),
  );

  const compactClass = metadata?.compactMode ? "1.2" : "1.6";
  const margins = metadata?.margins || {
    top: 48,
    bottom: 48,
    left: 48,
    right: 48,
  };
  const spacingLevel = metadata?.spacingLevel ?? 3;
  const sectionMargin = spacingLevel * 10;
  const itemGap = spacingLevel * 5;

  const renderSkillsExec = (section: (typeof sections)[0]) => {
    const items = section.items.filter((item) => item.visible !== false);
    if (skillsStyle === "tags") {
      return `<div style="display:flex;flex-wrap:wrap;gap:6px;font-size:13px;">
        ${items.map((item) => `<span style="border:1px solid ${color};color:${color};padding:3px 10px;border-radius:2px;">${escapeHtml(item.title)}</span>`).join("")}
      </div>`;
    }
    return `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;font-size:13px;">
      ${items
        .map((item) => {
          const level = parseLevel(item.level);
          const display =
            skillsStyle === "dots"
              ? renderLevelDots(level, color)
              : skillsStyle === "bar"
                ? renderLevelBar(level, color)
                : `<span style="color:#6b7280;font-size:12px;">${level}</span>`;
          return `<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:500;">${escapeHtml(item.title)}</span>${display}</div>`;
        })
        .join("")}
    </div>`;
  };

  const renderLanguagesExec = (section: (typeof sections)[0]) => {
    const items = section.items.filter((item) => item.visible !== false);
    return `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;font-size:13px;">
      ${items
        .map((item) => {
          const level = parseLevel(item.level || item.subtitle);
          const display =
            languagesStyle === "dots"
              ? renderLevelDots(level, color)
              : languagesStyle === "bar"
                ? renderLevelBar(level, color)
                : `<span style="color:#6b7280;font-size:12px;">${level}</span>`;
          return `<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:500;">${escapeHtml(item.title)}</span>${display}</div>`;
        })
        .join("")}
    </div>`;
  };

  const shouldUseSimple = (s: (typeof sections)[0]) => {
    const lt = (s.title || "").toLowerCase();
    const isCourse =
      s.type === "certifications" ||
      lt.includes("course") ||
      lt.includes("certif");
    const isList = lt.includes("interest") || lt.includes("hobb");
    return isList || (isCourse && coursesStyle === "simple");
  };

  const renderSimpleCols = (section: (typeof sections)[0]) => {
    const items = section.items.filter((i) => i.visible !== false);
    const cols = metadata?.sectionColumns?.[section.id] ?? 3;
    return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;font-size:13px;">
      ${items.map((item) => `<div>• ${escapeHtml(item.title)}</div>`).join("")}
    </div>`;
  };

  const content = `
    <div style="padding:${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px;min-height:100%;background:white;color:#1a1a1a;line-height:${compactClass};">
      <!-- Executive Header -->
      <header style="margin-bottom:${sectionMargin}px;border-bottom:3px solid ${color};padding-bottom:20px;">
        <h1 style="font-size:32px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${color};margin-bottom:6px;">
          ${escapeHtml(personalInfo.fullName)}
        </h1>
        ${personalInfo.jobTitle ? `<div style="font-size:16px;color:#4b5563;font-style:italic;margin-bottom:12px;">${escapeHtml(personalInfo.jobTitle)}</div>` : ""}
        <div style="font-size:13px;color:#4b5563;display:flex;flex-wrap:wrap;gap:12px;">
          ${personalInfo.email ? `<span>${escapeHtml(personalInfo.email)}</span>` : ""}
          ${personalInfo.phone ? `<span>| ${escapeHtml(personalInfo.phone)}</span>` : ""}
          ${personalInfo.city || personalInfo.country ? `<span>| ${escapeHtml([personalInfo.city, personalInfo.country].filter(Boolean).join(", "))}</span>` : ""}
          ${personalInfo.linkedin ? `<span>| <a href="${normalizeLinkedInUrl(personalInfo.linkedin)}" style="color:${color};">LinkedIn</a></span>` : ""}
          ${personalInfo.github ? `<span>| <a href="${normalizeGitHubUrl(personalInfo.github)}" style="color:${color};">GitHub</a></span>` : ""}
          ${personalInfo.website ? `<span>| <a href="${normalizeWebsiteUrl(personalInfo.website)}" style="color:${color};">Website</a></span>` : ""}
        </div>
      </header>

      ${
        personalInfo.summary
          ? `
        <section style="margin-bottom:${sectionMargin}px;">
          <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${color};border-bottom:1px solid #d1d5db;padding-bottom:6px;margin-bottom:10px;">
            ${metadata?.language === "ar" ? "الملخص المهني" : "Executive Summary"}
          </h2>
          <p style="font-size:14px;color:#374151;line-height:1.6;">${escapeHtml(personalInfo.summary)}</p>
        </section>
      `
          : ""
      }

      ${visibleSections
        .map((section) => {
          const items = section.items.filter((i) => i.visible !== false);
          if (items.length === 0) return "";
          return `
          <section style="margin-bottom:${sectionMargin}px;">
            <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${color};border-bottom:1px solid #d1d5db;padding-bottom:6px;margin-bottom:10px;">
              ${escapeHtml(section.title)}
            </h2>
            ${
              section.type === "skills"
                ? renderSkillsExec(section)
                : section.type === "languages"
                  ? renderLanguagesExec(section)
                  : shouldUseSimple(section)
                    ? renderSimpleCols(section)
                    : `<div style="display:flex;flex-direction:column;gap:${itemGap}px;">
                  ${items
                    .map(
                      (item) => `
                    <div>
                      <div style="display:flex;justify-content:space-between;align-items:baseline;">
                        <div>
                          <span style="font-size:15px;font-weight:600;">${escapeHtml(item.title)}</span>
                          ${item.subtitle ? `<span style="font-size:14px;color:#6b7280;"> — ${escapeHtml(item.subtitle)}</span>` : ""}
                        </div>
                        ${item.date || item.location ? `<span style="font-size:12px;color:#6b7280;white-space:nowrap;">${escapeHtml([item.date, item.location].filter(Boolean).join(" | "))}</span>` : ""}
                      </div>
                      ${item.description ? `<div style="font-size:13px;color:#374151;white-space:pre-wrap;margin-top:4px;padding-left:2px;">${escapeHtml(item.description)}</div>` : ""}
                    </div>
                  `,
                    )
                    .join("")}
                </div>`
            }
          </section>
        `;
        })
        .join("")}
    </div>
  `;

  const bodyFont = metadata?.bodyFontFamily || metadata?.fontFamily || "Inter";
  const headingFont =
    metadata?.headingFontFamily || metadata?.fontFamily || "Inter";
  return wrapInHtmlDocument(content, direction, bodyFont, headingFont);
}

// ============================================================================
// Minimal Template — Ultra-clean, no borders, generous whitespace, muted tones
// ============================================================================

function renderMinimalTemplate(data: ResumeData, color: string): string {
  const { personalInfo, sections, metadata } = data;
  const skillsStyle: SkillsDisplayStyle =
    metadata?.skillsDisplayStyle || "tags";
  const languagesStyle: LanguagesDisplayStyle =
    metadata?.languagesDisplayStyle || "level";
  const coursesStyle: CoursesDisplayStyle =
    metadata?.coursesDisplayStyle || "simple";

  const direction =
    metadata?.layoutDirection === "ltr"
      ? "ltr"
      : metadata?.layoutDirection === "rtl"
        ? "rtl"
        : metadata?.language === "ar"
          ? "rtl"
          : "ltr";

  const visibleSections = sections.filter(
    (s) =>
      s.visible !== false &&
      s.items &&
      s.items.some((i: any) => i.visible !== false),
  );

  const compactClass = metadata?.compactMode ? "1.25" : "1.7";
  const margins = metadata?.margins || {
    top: 40,
    bottom: 40,
    left: 56,
    right: 56,
  };
  const spacingLevel = metadata?.spacingLevel ?? 3;
  const sectionMargin = spacingLevel * 10;
  const itemGap = spacingLevel * 5;

  const renderSkillsMin = (section: (typeof sections)[0]) => {
    const items = section.items.filter((i) => i.visible !== false);
    if (skillsStyle === "tags") {
      return `<div style="font-size:13px;color:#374151;line-height:2;">${items.map((i) => escapeHtml(i.title)).join("  ·  ")}</div>`;
    }
    return `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:13px;">
      ${items
        .map((item) => {
          const level = parseLevel(item.level);
          const display =
            skillsStyle === "dots"
              ? renderLevelDots(level, color)
              : skillsStyle === "bar"
                ? renderLevelBar(level, color)
                : `<span style="color:#9ca3af;font-size:12px;">${level}</span>`;
          return `<div style="display:flex;justify-content:space-between;align-items:center;"><span>${escapeHtml(item.title)}</span>${display}</div>`;
        })
        .join("")}
    </div>`;
  };

  const renderLanguagesMin = (section: (typeof sections)[0]) => {
    const items = section.items.filter((i) => i.visible !== false);
    return `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:13px;">
      ${items
        .map((item) => {
          const level = parseLevel(item.level || item.subtitle);
          const display =
            languagesStyle === "dots"
              ? renderLevelDots(level, color)
              : languagesStyle === "bar"
                ? renderLevelBar(level, color)
                : `<span style="color:#9ca3af;font-size:12px;">${level}</span>`;
          return `<div style="display:flex;justify-content:space-between;align-items:center;"><span>${escapeHtml(item.title)}</span>${display}</div>`;
        })
        .join("")}
    </div>`;
  };

  const shouldUseSimple = (s: (typeof sections)[0]) => {
    const lt = (s.title || "").toLowerCase();
    const isCourse =
      s.type === "certifications" ||
      lt.includes("course") ||
      lt.includes("certif");
    const isList = lt.includes("interest") || lt.includes("hobb");
    return isList || (isCourse && coursesStyle === "simple");
  };

  const renderSimpleCols = (section: (typeof sections)[0]) => {
    const items = section.items.filter((i) => i.visible !== false);
    const cols = metadata?.sectionColumns?.[section.id] ?? 3;
    return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px;font-size:13px;color:#4b5563;">
      ${items.map((item) => `<div>${escapeHtml(item.title)}</div>`).join("")}
    </div>`;
  };

  const content = `
    <div style="padding:${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px;min-height:100%;background:white;color:#1f2937;line-height:${compactClass};">
      <!-- Minimal Header -->
      <header style="margin-bottom:${sectionMargin + 8}px;">
        <h1 style="font-size:28px;font-weight:300;letter-spacing:0.06em;text-transform:uppercase;color:#111827;margin-bottom:8px;">
          ${escapeHtml(personalInfo.fullName)}
        </h1>
        ${personalInfo.jobTitle ? `<div style="font-size:14px;color:#6b7280;margin-bottom:12px;">${escapeHtml(personalInfo.jobTitle)}</div>` : ""}
        <div style="font-size:12px;color:#9ca3af;display:flex;flex-wrap:wrap;gap:8px;">
          ${personalInfo.email ? `<span>${escapeHtml(personalInfo.email)}</span>` : ""}
          ${personalInfo.phone ? `<span>·</span><span>${escapeHtml(personalInfo.phone)}</span>` : ""}
          ${personalInfo.city || personalInfo.country ? `<span>·</span><span>${escapeHtml([personalInfo.city, personalInfo.country].filter(Boolean).join(", "))}</span>` : ""}
          ${personalInfo.linkedin ? `<span>·</span><a href="${normalizeLinkedInUrl(personalInfo.linkedin)}" style="color:${color};">LinkedIn</a>` : ""}
          ${personalInfo.github ? `<span>·</span><a href="${normalizeGitHubUrl(personalInfo.github)}" style="color:${color};">GitHub</a>` : ""}
          ${personalInfo.website ? `<span>·</span><a href="${normalizeWebsiteUrl(personalInfo.website)}" style="color:${color};">Website</a>` : ""}
        </div>
      </header>

      ${
        personalInfo.summary
          ? `
        <section style="margin-bottom:${sectionMargin}px;">
          <p style="font-size:13px;color:#4b5563;line-height:1.7;">${escapeHtml(personalInfo.summary)}</p>
        </section>
      `
          : ""
      }

      ${visibleSections
        .map((section) => {
          const items = section.items.filter((i) => i.visible !== false);
          if (items.length === 0) return "";
          return `
          <section style="margin-bottom:${sectionMargin}px;">
            <h2 style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:${color};margin-bottom:10px;">
              ${escapeHtml(section.title)}
            </h2>
            ${
              section.type === "skills"
                ? renderSkillsMin(section)
                : section.type === "languages"
                  ? renderLanguagesMin(section)
                  : shouldUseSimple(section)
                    ? renderSimpleCols(section)
                    : `<div style="display:flex;flex-direction:column;gap:${itemGap}px;">
                  ${items
                    .map(
                      (item) => `
                    <div>
                      <div style="display:flex;justify-content:space-between;align-items:baseline;">
                        <span style="font-size:14px;font-weight:500;">${escapeHtml(item.title)}${item.subtitle ? `<span style="font-weight:400;color:#6b7280;"> — ${escapeHtml(item.subtitle)}</span>` : ""}</span>
                        ${item.date || item.location ? `<span style="font-size:11px;color:#9ca3af;">${escapeHtml([item.date, item.location].filter(Boolean).join(" · "))}</span>` : ""}
                      </div>
                      ${item.description ? `<div style="font-size:13px;color:#4b5563;white-space:pre-wrap;margin-top:4px;">${escapeHtml(item.description)}</div>` : ""}
                    </div>
                  `,
                    )
                    .join("")}
                </div>`
            }
          </section>
        `;
        })
        .join("")}
    </div>
  `;

  const bodyFont = metadata?.bodyFontFamily || metadata?.fontFamily || "Inter";
  const headingFont =
    metadata?.headingFontFamily || metadata?.fontFamily || "Inter";
  return wrapInHtmlDocument(content, direction, bodyFont, headingFont);
}

// ============================================================================
// Main Export Function
// ============================================================================

export type TemplateType =
  | "modern"
  | "classic"
  | "creative"
  | "executive"
  | "minimal";

export function renderResumeHtml(
  data: ResumeData,
  template: TemplateType = "modern",
  color: string = "#000000",
): string {
  switch (template) {
    case "classic":
      return renderClassicTemplate(data, color);
    case "executive":
      return renderExecutiveTemplate(data, color);
    case "creative":
      return renderCreativeTemplate(data, color);
    case "minimal":
      return renderMinimalTemplate(data, color);
    case "modern":
    default:
      return renderModernTemplate(data, color);
  }
}
