import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/middleware/api-auth";
import { logApiUsage } from "@/lib/services/appwrite-server-database";
import { jsPDF } from "jspdf";

// PDF parsing - only load if available (not in serverless)
let pdfParse: any = null;
try {
  pdfParse = require("pdf-parse");
} catch (error) {
  console.warn(
    "pdf-parse not available in this environment. PDF input will not be supported."
  );
}

/**
 * API Endpoint: Generate Masked CV from Text or PDF
 * POST /api/cv/generate-masked
 *
 * Accepts:
 * - JSON: { "cv": "text content", "isPdf": false }
 * - Multipart: file upload with optional "isPdf" field
 *
 * Returns: Masked PDF as base64
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate API request
    const authResult = await authenticateApiRequest(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    let cvText = "";
    const contentType = request.headers.get("content-type") || "";

    // Handle multipart/form-data (file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("cv") as File;
      const isPdf =
        formData.get("isPdf") === "true" || file?.type === "application/pdf";

      if (!file) {
        return NextResponse.json(
          { error: "Missing required field: cv (file)" },
          { status: 400 }
        );
      }

      if (isPdf) {
        if (!pdfParse) {
          return NextResponse.json(
            {
              success: false,
              error:
                "PDF input is not supported in this environment. Please provide CV as text.",
            },
            { status: 400 }
          );
        }
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
      const { cv, isPdf } = body;

      if (!cv) {
        return NextResponse.json(
          { error: "Missing required field: cv" },
          { status: 400 }
        );
      }

      if (isPdf) {
        if (!pdfParse) {
          return NextResponse.json(
            {
              success: false,
              error:
                "PDF input is not supported in this environment. Please provide CV as text.",
            },
            { status: 400 }
          );
        }
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
      return NextResponse.json(
        { error: "Failed to extract text from CV" },
        { status: 400 }
      );
    }

    // Mask personal information
    const maskedText = maskPersonalInformation(cvText);

    // Generate PDF from masked text
    const pdfBase64 = generatePDF(maskedText);

    // Log API usage
    if (authResult.userId) {
      await logApiUsage(authResult.userId, {
        endpoint: "/api/cv/generate-masked",
        timestamp: new Date().toISOString(),
        success: true,
      });
    }

    // Generate unique filename: masked-cv-YYYYMMDD-HHMMSS-RANDOM.pdf
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\..+/, "")
      .replace("T", "-");
    const randomId = Math.random().toString(36).substring(2, 8);
    const filename = `masked-cv-${timestamp}-${randomId}.pdf`;

    // Return masked PDF as base64
    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      filename: filename,
      message: "Masked CV generated successfully",
    });
  } catch (error) {
    console.error("Error generating masked CV:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Log failed API usage
    try {
      const authResult = await authenticateApiRequest(request);
      if (authResult.userId) {
        await logApiUsage(authResult.userId, {
          endpoint: "/api/cv/generate-masked",
          timestamp: new Date().toISOString(),
          success: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        });
      }
    } catch (logError) {
      console.error("Error logging API usage:", logError);
    }

    // Return detailed error in development, generic in production
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const isDevelopment = process.env.NODE_ENV === "development";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate masked CV",
        details: isDevelopment ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Mask personal information in CV text
 */
function maskPersonalInformation(text: string): string {
  let maskedText = text;

  // Mask email addresses
  maskedText = maskedText.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[EMAIL REDACTED]"
  );

  // Mask phone numbers (various formats)
  maskedText = maskedText.replace(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    "[PHONE REDACTED]"
  );

  // Mask LinkedIn URLs
  maskedText = maskedText.replace(
    /https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/gi,
    "[LINKEDIN REDACTED]"
  );

  // Mask GitHub URLs
  maskedText = maskedText.replace(
    /https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+/gi,
    "[GITHUB REDACTED]"
  );

  // Mask personal websites
  maskedText = maskedText.replace(
    /https?:\/\/(www\.)?[a-zA-Z0-9-]+\.(com|net|org|io|dev|me)/gi,
    "[WEBSITE REDACTED]"
  );

  // Mask addresses (basic pattern)
  maskedText = maskedText.replace(
    /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way)/gi,
    "[ADDRESS REDACTED]"
  );

  // Mask dates of birth (MM/DD/YYYY or DD/MM/YYYY)
  maskedText = maskedText.replace(
    /\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}\b/g,
    "[DOB REDACTED]"
  );

  // Mask social security numbers (XXX-XX-XXXX)
  maskedText = maskedText.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN REDACTED]");

  return maskedText;
}

/**
 * Generate PDF from text
 */
function generatePDF(text: string): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 7;
  let y = margin;

  // Add title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Masked CV", margin, y);
  y += lineHeight * 2;

  // Add masked content
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const lines = doc.splitTextToSize(text, maxWidth);

  for (const line of lines) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  // Convert to base64
  const pdfBase64 = doc.output("datauristring").split(",")[1];
  return pdfBase64;
}
