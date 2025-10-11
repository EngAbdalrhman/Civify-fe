import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/middleware/api-auth";
import { logApiUsage } from "@/lib/services/appwrite-server-database";
import { jsPDF } from "jspdf";
import { getDocument } from "pdfjs-dist";

/**
 * API Endpoint: Generate Masked CV from PDF
 * POST /api/cv/generate-masked-pdf
 *
 * Accepts a base64-encoded PDF, extracts text, masks personal information,
 * and returns a masked PDF.
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

    // Parse request body
    const body = await request.json();
    const { cvPdf } = body;

    if (!cvPdf) {
      return NextResponse.json(
        { error: "Missing required field: cvPdf (base64-encoded PDF)" },
        { status: 400 }
      );
    }

    // Validate base64 format
    if (!isValidBase64(cvPdf)) {
      return NextResponse.json(
        { error: "Invalid base64 format for cvPdf" },
        { status: 400 }
      );
    }

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(cvPdf);

    if (!extractedText) {
      return NextResponse.json(
        { error: "Failed to extract text from PDF" },
        { status: 400 }
      );
    }

    // Mask personal information
    const maskedText = maskPersonalInformation(extractedText);

    // Generate masked PDF
    const maskedPdf = generateMaskedPDF(maskedText);

    // Log API usage
    if (authResult.userId) {
      await logApiUsage(authResult.userId, {
        endpoint: "/api/cv/generate-masked-pdf",
        timestamp: new Date().toISOString(),
        success: true,
      });
    }

    // Return masked PDF as base64
    return NextResponse.json({
      success: true,
      maskedPdf: maskedPdf,
      message: "CV masked successfully",
    });
  } catch (error) {
    console.error("Error generating masked PDF:", error);

    // Log failed API usage
    try {
      const authResult = await authenticateApiRequest(request);
      if (authResult.userId) {
        await logApiUsage(authResult.userId, {
          endpoint: "/api/cv/generate-masked-pdf",
          timestamp: new Date().toISOString(),
          success: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        });
      }
    } catch (logError) {
      console.error("Error logging API usage:", logError);
    }

    return NextResponse.json(
      {
        error: "Failed to generate masked PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Validate base64 string
 */
function isValidBase64(str: string): boolean {
  try {
    // Remove data URL prefix if present
    const base64String = str.replace(/^data:application\/pdf;base64,/, "");

    // Check if valid base64
    const decoded = Buffer.from(base64String, "base64");
    const encoded = decoded.toString("base64");

    return base64String === encoded;
  } catch (error) {
    return false;
  }
}

/**
 * Extract text from PDF using pdf.js
 */
async function extractTextFromPDF(base64Pdf: string): Promise<string> {
  try {
    // Remove data URL prefix if present
    const base64String = base64Pdf.replace(
      /^data:application\/pdf;base64,/,
      ""
    );

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(base64String, "base64");

    // Load PDF document with proper configuration
    const loadingTask = getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true,
      standardFontDataUrl:
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/",
    });

    const pdf = await loadingTask.promise;

    let fullText = "";

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText.trim();
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Mask personal information in text
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

  // Mask addresses (simple pattern - can be improved)
  maskedText = maskedText.replace(
    /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way|Place|Pl)[,\s]+[A-Za-z\s]+[,\s]+[A-Z]{2}\s+\d{5}/gi,
    "[ADDRESS REDACTED]"
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
 * Generate PDF from masked text
 */
function generateMaskedPDF(text: string): string {
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
  const pdfBase64 = doc.output("datauristring");
  return pdfBase64;
}
