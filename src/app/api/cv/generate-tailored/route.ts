import { NextRequest } from "next/server";
import {
  authenticateApiRequest,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/api-auth";
import { logApiUsage } from "@/lib/services/appwrite-server-database";
import { parseCv } from "@/ai/flows/cv-parsing";
import { tailorCv } from "@/ai/flows/cv-tailoring";
import jsPDF from "jspdf";

// @ts-ignore - pdf-parse doesn't have proper TypeScript types
const pdfParse = require("pdf-parse");

/**
 * API Endpoint: Generate Tailored CV PDF
 * POST /api/cv/generate-tailored
 *
 * Accepts:
 * - JSON: { "cv": "text", "jobDescription": "text", "masked": boolean, "isPdf": false }
 * - Multipart: file upload with jobDescription and optional masked/isPdf fields
 *
 * Output: { pdf: string } - base64-encoded PDF of AI-tailored CV
 *
 * Requires: Valid API key from licensed account
 */
export async function POST(request: NextRequest) {
  // Authenticate the request
  const authResult = await authenticateApiRequest(request);

  if (!authResult.authenticated) {
    return createErrorResponse(authResult.error || "Unauthorized", 401);
  }

  const userId = authResult.userId!;

  try {
    let cvText = "";
    let jobDescription = "";
    let masked = false;
    const contentType = request.headers.get("content-type") || "";

    // Handle multipart/form-data (file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("cv") as File;
      const isPdf =
        formData.get("isPdf") === "true" || file?.type === "application/pdf";
      jobDescription = (formData.get("jobDescription") as string) || "";
      masked = formData.get("masked") === "true";

      if (!file) {
        return createErrorResponse(
          "Invalid request: 'cv' file is required",
          400
        );
      }

      if (!jobDescription) {
        return createErrorResponse(
          "Invalid request: 'jobDescription' field is required",
          400
        );
      }

      if (isPdf) {
        // Extract text from PDF
        const buffer = Buffer.from(await file.arrayBuffer());
        const data = await pdfParse(buffer);
        cvText = data.text;
      } else {
        // Read text file
        cvText = await file.text();
      }
    }
    // Handle JSON (text content)
    else {
      const body = await request.json();
      const cv = body.cv;
      const isPdf = body.isPdf || false;
      jobDescription = body.jobDescription;
      masked = body.masked || false;

      if (!cv || typeof cv !== "string") {
        return createErrorResponse(
          "Invalid request: 'cv' field is required and must be a string",
          400
        );
      }

      if (!jobDescription || typeof jobDescription !== "string") {
        return createErrorResponse(
          "Invalid request: 'jobDescription' field is required and must be a string",
          400
        );
      }

      if (isPdf) {
        // Decode base64 PDF and extract text
        const base64String = cv.replace(/^data:application\/pdf;base64,/, "");
        const buffer = Buffer.from(base64String, "base64");
        const data = await pdfParse(buffer);
        cvText = data.text;
      } else {
        cvText = cv;
      }
    }

    if (!cvText || cvText.trim().length === 0) {
      return createErrorResponse("Failed to extract text from CV", 400);
    }

    // Parse CV using AI (same as Step 1 in the app)
    console.log("Parsing CV text with AI...");
    const structuredCvData = await parseCv({ cvText });
    console.log(
      "Structured CV data:",
      JSON.stringify(structuredCvData, null, 2)
    );

    // Tailor the CV using AI (same as Step 4 in the app)
    console.log("Tailoring CV with job description...");
    const tailoredResult = await tailorCv({
      structuredCvData,
      jobDescription,
    });
    console.log("Tailored CV length:", tailoredResult.tailoredCv?.length || 0);

    let tailoredCV = tailoredResult.tailoredCv;

    // Mask personal information if requested
    if (masked) {
      tailoredCV = maskPersonalInfo(tailoredCV);
    }

    // Generate PDF from HTML
    const pdfBase64 = generatePDFFromHTML(tailoredCV, masked);

    // Log API usage
    await logApiUsage(userId, {
      endpoint: "/api/cv/generate-tailored",
      timestamp: new Date().toISOString(),
      success: true,
    });

    // Generate unique filename: tailored-cv-[masked-]YYYYMMDD-HHMMSS-RANDOM.pdf
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\..+/, "")
      .replace("T", "-");
    const randomId = Math.random().toString(36).substring(2, 8);
    const maskedPrefix = masked ? "masked-" : "";
    const filename = `tailored-cv-${maskedPrefix}${timestamp}-${randomId}.pdf`;

    return createSuccessResponse({ pdf: pdfBase64, filename: filename });
  } catch (error) {
    console.error("Error generating tailored CV:", error);

    // Log failed API usage
    try {
      await logApiUsage(userId, {
        endpoint: "/api/cv/generate-tailored",
        timestamp: new Date().toISOString(),
        success: false,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    } catch (logError) {
      console.error("Error logging API usage:", logError);
    }

    return createErrorResponse("Failed to generate tailored CV", 500);
  }
}

/**
 * Generate PDF from HTML content
 */
function generatePDFFromHTML(html: string, isMasked: boolean): string {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper to add spacing
  const addSpacing = (space: number) => {
    yPosition += space;
  };

  // Helper to check if we need a new page
  const checkNewPage = (requiredSpace: number = 10) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper to add text with wrapping
  const addText = (
    text: string,
    fontSize: number = 10,
    fontStyle: "normal" | "bold" | "italic" = "normal",
    indent: number = 0
  ) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", fontStyle);
    const lines = pdf.splitTextToSize(text, maxWidth - indent);
    for (const line of lines) {
      checkNewPage();
      pdf.text(line, margin + indent, yPosition);
      yPosition += fontSize * 0.4;
    }
  };

  // Parse HTML and convert to PDF (server-side, no DOM)
  const htmlLines = html.split("\n");

  for (const line of htmlLines) {
    const trimmed = line.trim();

    if (!trimmed) continue;

    // H1 - Name
    if (trimmed.startsWith("<h1>")) {
      checkNewPage(15);
      const text = trimmed.replace(/<\/?h1>/g, "");
      addText(text, 18, "bold");
      addSpacing(3);
    }
    // H2 - Section headers
    else if (trimmed.startsWith("<h2>")) {
      checkNewPage(12);
      addSpacing(4);
      const text = trimmed.replace(/<\/?h2>/g, "");
      addText(text, 14, "bold");
      addSpacing(2);
    }
    // H3 - Subsection headers
    else if (trimmed.startsWith("<h3>")) {
      checkNewPage(10);
      addSpacing(2);
      const text = trimmed.replace(/<\/?h3>/g, "");
      addText(text, 12, "bold");
      addSpacing(1);
    }
    // Paragraph
    else if (trimmed.startsWith("<p>")) {
      checkNewPage(8);
      const text = trimmed
        .replace(/<\/?p>/g, "")
        .replace(/<a[^>]*>([^<]+)<\/a>/g, "$1");
      if (text) {
        addText(text, 10, "normal");
        addSpacing(2);
      }
    }
    // List item
    else if (trimmed.startsWith("<li>")) {
      checkNewPage(6);
      const text = trimmed.replace(/<\/?li>/g, "").replace(/<\/?strong>/g, "");
      addText(`• ${text}`, 10, "normal", 3);
      addSpacing(1);
    }
  }

  // Add footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      isMasked ? "Tailored CV (Masked)" : "Tailored CV",
      margin,
      pageHeight - 10
    );
    pdf.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin - 20,
      pageHeight - 10
    );
    pdf.setTextColor(0, 0, 0);
  }

  return pdf.output("datauristring").split(",")[1];
}

/**
 * Mask personal information in CV HTML
 */
function maskPersonalInfo(html: string): string {
  let maskedHtml = html;

  // Mask email addresses (including in HTML tags)
  maskedHtml = maskedHtml.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[EMAIL REDACTED]"
  );

  // Mask phone numbers (various formats)
  maskedHtml = maskedHtml.replace(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    "[PHONE REDACTED]"
  );

  // Mask LinkedIn URLs (in href and text)
  maskedHtml = maskedHtml.replace(
    /<a\s+href="https?:\/\/(www\.)?linkedin\.com\/in\/[^"]+">LinkedIn<\/a>/gi,
    "[LINKEDIN REDACTED]"
  );
  maskedHtml = maskedHtml.replace(
    /https?:\/\/(www\.)?linkedin\.com\/in\/[^\s<>"]+/gi,
    "[LINKEDIN REDACTED]"
  );
  maskedHtml = maskedHtml.replace(
    /linkedin\.com\/in\/[^\s<>"]+/gi,
    "[LINKEDIN REDACTED]"
  );

  // Mask GitHub URLs (in href and text)
  maskedHtml = maskedHtml.replace(
    /<a\s+href="https?:\/\/(www\.)?github\.com\/[^"]+">GitHub<\/a>/gi,
    "[GITHUB REDACTED]"
  );
  maskedHtml = maskedHtml.replace(
    /https?:\/\/(www\.)?github\.com\/[^\s<>"]+/gi,
    "[GITHUB REDACTED]"
  );
  maskedHtml = maskedHtml.replace(
    /github\.com\/[^\s<>"]+/gi,
    "[GITHUB REDACTED]"
  );

  // Mask general URLs
  maskedHtml = maskedHtml.replace(
    /<a\s+href="https?:\/\/[^"]+">([^<]+)<\/a>/gi,
    "[WEBSITE REDACTED]"
  );

  // Mask addresses
  maskedHtml = maskedHtml.replace(
    /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b[^<\n]*/gi,
    "[ADDRESS REDACTED]"
  );

  return maskedHtml;
}
