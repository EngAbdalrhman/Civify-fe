import { saveAs } from "file-saver";
import type { ResumeData } from "../types";
import { exportResumeToDocx } from "./docxExport";

export type TemplateType =
  | "modern"
  | "classic"
  | "creative"
  | "executive"
  | "minimal";

/**
 * Export the CV to PDF using Puppeteer (server-side rendering)
 * This produces high-quality PDFs with selectable text (ATS friendly)
 * and identical rendering to the browser preview.
 */
export async function exportToPdfPuppeteer(
  resumeData: ResumeData,
  options: {
    filename?: string;
    template?: TemplateType;
    color?: string;
  } = {},
): Promise<void> {
  const {
    filename = "resume",
    template = "modern",
    color = "#000000",
  } = options;

  try {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeData,
        template,
        color,
        filename,
      }),
    });

    // Check if response is JSON (error) instead of PDF
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || contentType.includes("application/json")) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    // Verify we got a PDF (log warning instead of throwing)
    if (
      !contentType.includes("application/pdf") &&
      !contentType.includes("octet-stream")
    ) {
      console.warn(`Unexpected content type: ${contentType}`);
    }

    const blob = await response.blob();

    // Verify blob is not empty
    if (blob.size === 0) {
      throw new Error("Received empty PDF file");
    }

    // Use native download approach
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.pdf`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
}

/**
 * Reliable download helper with fallback for environments where saveAs doesn't work
 */
function downloadBlob(blob: Blob, filename: string): void {
  try {
    // Try native approach first (more reliable in modern browsers)
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Delay revocation to ensure download starts
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    // Fallback to file-saver
    console.warn("Native download failed, using file-saver fallback:", error);
    saveAs(blob, filename);
  }
}

/**
 * Export the CV to PDF by generating directly from resume data
 * Uses drawing primitives for graphics to avoid font encoding issues
 */
export async function exportToPdf(
  element: HTMLElement,
  filename: string = "cv",
  resumeData?: ResumeData,
  translations?: any,
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const data = resumeData || (window as any).__cvExportData;
  if (!data) {
    throw new Error("No resume data available for PDF export");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addNewPageIfNeeded = (requiredSpace: number = 15) => {
    if (y + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  const addText = (
    text: string,
    fontSize: number,
    options: {
      bold?: boolean;
      italic?: boolean;
      color?: string;
      align?: "left" | "center" | "right";
      x?: number;
    } = {},
  ) => {
    pdf.setFontSize(fontSize);
    pdf.setTextColor(options.color || "#1f2937");

    if (options.bold && options.italic) {
      pdf.setFont("helvetica", "bolditalic");
    } else if (options.bold) {
      pdf.setFont("helvetica", "bold");
    } else if (options.italic) {
      pdf.setFont("helvetica", "italic");
    } else {
      pdf.setFont("helvetica", "normal");
    }

    const x =
      options.x ||
      (options.align === "center"
        ? pageWidth / 2
        : options.align === "right"
          ? pageWidth - margin
          : margin);

    // Simple single line text if no wrapping needed related logic, but splitTextToSize checks width
    const lines = pdf.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.4;

    lines.forEach((line: string) => {
      addNewPageIfNeeded(lineHeight);
      pdf.text(line, x, y, { align: options.align });
      y += lineHeight;
    });
  };

  const addLine = () => {
    addNewPageIfNeeded(5);
    pdf.setDrawColor("#374151");
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  // Helper to draw skill bars using rectangles
  const drawSkillBar = (
    level: string,
    x: number,
    currentY: number,
    width: number = 40,
    height: number = 3,
  ) => {
    // Background bar
    pdf.setFillColor("#e5e7eb"); // gray-200
    pdf.rect(x, currentY - height + 1, width, height, "F");

    // Foreground bar
    let percentage = 0;
    switch (level.toLowerCase()) {
      case "expert":
        percentage = 1.0;
        break;
      case "advanced":
        percentage = 0.8;
        break;
      case "intermediate":
        percentage = 0.6;
        break;
      case "beginner":
        percentage = 0.4;
        break;
      default:
        percentage = 0.2;
    }

    pdf.setFillColor("#374151"); // gray-700
    pdf.rect(x, currentY - height + 1, width * percentage, height, "F");
  };

  // Helper to draw dots
  const drawDots = (level: string, x: number, currentY: number) => {
    let score = 0;
    switch (level.toLowerCase()) {
      case "expert":
      case "native":
      case "fluent":
        score = 5;
        break;
      case "advanced":
        score = 4;
        break;
      case "intermediate":
        score = 3;
        break;
      case "beginner":
        score = 2;
        break;
      default:
        score = 1;
    }

    const dotSize = 1.5;
    const gap = 4;

    for (let i = 0; i < 5; i++) {
      const dotX = x + i * gap;
      // Filled if i < score, empty circle otherwise
      if (i < score) {
        pdf.setFillColor("#374151");
        pdf.circle(dotX, currentY - 1, dotSize, "F");
      } else {
        pdf.setDrawColor("#9ca3af");
        pdf.setLineWidth(0.1);
        pdf.circle(dotX, currentY - 1, dotSize, "S");
      }
    }
  };

  const { personalInfo, sections } = data;

  // Header - Name
  addText(personalInfo.fullName || "Resume", 24, {
    bold: true,
    align: "center",
  });
  y += 2;

  // Contact info
  const contactParts: string[] = [];
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.city || personalInfo.country) {
    contactParts.push(
      [personalInfo.city, personalInfo.country].filter(Boolean).join(", "),
    );
  }
  if (contactParts.length > 0) {
    addText(contactParts.join(" | "), 10, {
      align: "center",
      color: "#6b7280",
    });
  }

  // Links
  const linkParts: string[] = [];
  if (personalInfo.linkedin) linkParts.push(personalInfo.linkedin);
  if (personalInfo.github) linkParts.push(personalInfo.github);
  if (personalInfo.website) linkParts.push(personalInfo.website);
  if (linkParts.length > 0) {
    addText(linkParts.join(" | "), 9, { align: "center", color: "#6b7280" });
  }

  y += 5;

  // Helper to get localized section title
  const getSectionTitle = (sectionType: string, defaultTitle: string) => {
    if (translations?.resume?.sections?.[sectionType]) {
      return translations.resume.sections[sectionType];
    }
    return defaultTitle;
  };

  // Helper to get localized header
  const getHeader = (key: string, defaultText: string) => {
    if (translations?.resume?.sections?.[key]) {
      return translations.resume.sections[key];
    }
    return defaultText;
  };

  // Summary
  if (personalInfo.summary) {
    addLine();
    addText(getHeader("summary", "PROFESSIONAL SUMMARY"), 12, { bold: true });
    y += 2;
    addText(personalInfo.summary, 10);
    y += 5;
  }

  // Sections - filter out empty and hidden sections
  const visibleSections = (sections || []).filter(
    (s: { visible: boolean; isVisible: boolean; items: string | any[] }) =>
      s.visible !== false &&
      s.isVisible !== false &&
      s.items &&
      s.items.length > 0,
  );

  for (const section of visibleSections) {
    addNewPageIfNeeded(20);
    addLine();
    // Localize title
    const localizedTitle = getSectionTitle(section.type, section.title);
    addText(localizedTitle.toUpperCase(), 12, { bold: true });
    y += 3;

    if (section.type === "skills") {
      const skillsStyle = resumeData?.metadata?.skillsDisplayStyle || "tags";
      const items = section.items || [];

      if (skillsStyle === "tags") {
        // Comma-separated list
        const skills = items
          .map((item: { title?: string }) => item.title)
          .filter(Boolean)
          .join(", ");
        if (skills) {
          addText(skills, 10);
        }
      } else {
        // Bar/Dots style
        for (const item of items as {
          title?: string;
          level?: string;
          subtitle?: string;
        }[]) {
          addNewPageIfNeeded(8);
          const level = item.level || "intermediate";

          addText(item.title || "", 10);

          // Draw logic
          // Move Y back up because addText advanced it
          const graphicY = y;
          y -= 4; // approximate backtrack to align with text baseline

          const graphicX = margin + 60; // Offset for graphics

          if (skillsStyle === "bar") {
            drawSkillBar(level, graphicX, y);
          } else if (skillsStyle === "dots") {
            drawDots(level, graphicX, y);
          } else {
            // Text fallback
            pdf.text(`(${level})`, graphicX, y);
          }

          y = graphicY; // Restore Y
        }
      }
    } else if (section.type === "languages") {
      const languagesStyle =
        resumeData?.metadata?.languagesDisplayStyle || "level";

      for (const item of section.items || []) {
        addNewPageIfNeeded(8);
        const level = (
          item.subtitle ||
          item.level ||
          "intermediate"
        ).toLowerCase();

        addText(item.title || "", 10);

        const graphicY = y;
        y -= 4;
        const graphicX = margin + 60;

        if (languagesStyle === "bar") {
          drawSkillBar(level, graphicX, y);
        } else if (languagesStyle === "dots") {
          drawDots(level, graphicX, y);
        } else {
          pdf.text(
            ` - ${item.subtitle || "Intermediate"}`,
            margin + pdf.getTextWidth(item.title || "") + 2,
            y,
          );
        }

        y = graphicY;
      }
    } else if (
      (section.type === "certifications" ||
        section.title?.toLowerCase().includes("course")) &&
      resumeData?.metadata?.coursesDisplayStyle === "simple"
    ) {
      // Simple bullet list for courses - MULTI-COLUMN
      // 3 Columns
      const items = section.items || [];
      const colCount = 3;
      const colWidth = contentWidth / colCount;
      const rowHeight = 6;

      // Calculate layout
      let maxY = y;

      items.forEach((item: any, index: number) => {
        const colIndex = index % colCount;

        // If starting new row (colIndex == 0), verify space
        if (colIndex === 0) {
          addNewPageIfNeeded(rowHeight);
        }

        // Current X and Y
        // If we added a page, 'y' was reset. We need to track 'currentRowY' carefully.
        // Since addNewPageIfNeeded modifies 'y', we can rely on 'y' being the current row start.
        // But 'y' increments effectively per row.

        const xPos = margin + colIndex * colWidth;
        // Only increment y after filling the last column

        pdf.setFontSize(9);
        pdf.text(`• ${item.title}`, xPos, y);

        if (colIndex === colCount - 1 || index === items.length - 1) {
          y += rowHeight;
        }
      });
    } else {
      for (const item of section.items || []) {
        addNewPageIfNeeded(15);

        // Title line
        let titleLine = item.title || "";
        if (item.subtitle) titleLine += ` | ${item.subtitle}`;
        addText(titleLine, 11, { bold: true });

        // Date/Location line
        if (item.date || item.location) {
          addText([item.date, item.location].filter(Boolean).join(" | "), 9, {
            italic: true,
            color: "#6b7280",
          });
        }

        // Description
        if (item.description) {
          y += 1;
          const lines = item.description
            .split("\n")
            .filter((l: string) => l.trim());
          for (const line of lines) {
            addNewPageIfNeeded(6);
            const bulletLine =
              line.startsWith("•") || line.startsWith("-") ? line : `• ${line}`;
            addText(bulletLine, 9);
          }
        }
        y += 3;
      }
    }
    y += 3;
  }

  pdf.save(`${filename}.pdf`);
}

/**
 * Export the CV data to DOCX format.
 * Delegates to the dedicated docxExport module.
 */
export async function exportToDocx(
  resumeData: ResumeData,
  filename: string = "cv",
  translations?: any,
): Promise<void> {
  return exportResumeToDocx(resumeData, filename, translations);
}
