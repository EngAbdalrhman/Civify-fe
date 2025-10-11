import { NextRequest } from "next/server";
import {
  authenticateApiRequest,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/api-auth";
import { AppwriteDatabaseService } from "@/lib/services/appwrite-database";
import { tailorCv } from "@/ai/flows/cv-tailoring";
import jsPDF from "jspdf";

/**
 * API Endpoint: Generate Tailored CV PDF
 * POST /api/cv/generate-tailored
 *
 * Input: { cv: string, jobDescription: string, masked: boolean }
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
    // Parse request body
    const body = await request.json();
    const { cv, jobDescription, masked = false } = body;

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

    // Parse CV if it's JSON, otherwise use as text
    let structuredCvData;
    try {
      structuredCvData = JSON.parse(cv);
    } catch {
      // If not JSON, create a simple structure
      structuredCvData = {
        personalInfo: {},
        summary: "",
        experience: [],
        education: [],
        skills: [],
      };
    }

    // Tailor the CV using AI
    const tailoredResult = await tailorCv({
      structuredCvData,
      jobDescription,
    });

    let tailoredCV = tailoredResult.tailoredCv;

    // Mask personal information if requested
    if (masked) {
      tailoredCV = maskPersonalInfo(tailoredCV);
    }

    // Generate PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    // Add title
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      masked ? "Tailored CV (Masked)" : "Tailored CV",
      margin,
      margin + 10
    );

    // Add tailored CV content
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const lines = pdf.splitTextToSize(tailoredCV, maxWidth);
    let yPosition = margin + 20;

    for (const line of lines) {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    }

    // Convert PDF to base64
    const pdfBase64 = pdf.output("datauristring").split(",")[1];

    // Log API usage
    const database = new AppwriteDatabaseService(userId);
    await database.logApiUsage({
      endpoint: "/api/cv/generate-tailored",
      timestamp: new Date().toISOString(),
      success: true,
    });

    return createSuccessResponse({ pdf: pdfBase64 });
  } catch (error) {
    console.error("Error generating tailored CV:", error);

    // Log failed API usage
    try {
      const database = new AppwriteDatabaseService(userId);
      await database.logApiUsage({
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
 * Mask personal information in CV text
 */
function maskPersonalInfo(text: string): string {
  let maskedText = text;

  // Mask email addresses
  maskedText = maskedText.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    (email) => {
      const [username, domain] = email.split("@");
      return `${"*".repeat(Math.min(username.length, 3))}@${"*".repeat(
        Math.min(domain.split(".")[0].length, 3)
      )}.${domain.split(".").slice(1).join(".")}`;
    }
  );

  // Mask phone numbers
  maskedText = maskedText.replace(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    "[Phone Hidden]"
  );

  // Mask LinkedIn profiles
  maskedText = maskedText.replace(
    /https?:\/\/(www\.)?linkedin\.com\/in\/[^\s<>]+/gi,
    "[LinkedIn Hidden]"
  );
  maskedText = maskedText.replace(
    /linkedin\.com\/in\/[^\s<>]+/gi,
    "[LinkedIn Hidden]"
  );
  maskedText = maskedText.replace(
    /LinkedIn:\s*[^\s<>|]+/gi,
    "LinkedIn: [Hidden]"
  );

  // Mask GitHub profiles
  maskedText = maskedText.replace(
    /https?:\/\/(www\.)?github\.com\/[^\s<>]+/gi,
    "[GitHub Hidden]"
  );
  maskedText = maskedText.replace(/github\.com\/[^\s<>]+/gi, "[GitHub Hidden]");
  maskedText = maskedText.replace(/GitHub:\s*[^\s<>|]+/gi, "GitHub: [Hidden]");

  // Mask general social media
  maskedText = maskedText.replace(
    /https?:\/\/(www\.)?(twitter|facebook|instagram)\.com\/[^\s<>]+/gi,
    "[Social Profile Hidden]"
  );

  // Mask addresses
  maskedText = maskedText.replace(
    /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b[^,\n]*(?:,\s*[A-Za-z\s]+)?(?:,\s*[A-Z]{2}\s*\d{5})?/gi,
    "[Address Hidden]"
  );

  return maskedText;
}
