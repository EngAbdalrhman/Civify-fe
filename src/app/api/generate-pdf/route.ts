/**
 * PDF Generation API Route using Puppeteer
 *
 * This route renders resume HTML using headless Chrome and returns a high-quality PDF
 * with selectable text (ATS friendly) and identical rendering to browser preview.
 *
 * Uses installed browser in Docker container with required args for Docker environment.
 */

import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import {
  renderResumeHtml,
  type TemplateType,
} from "@/features/resume-builder/utils/renderResumeHtml";
import type { ResumeData } from "@/features/upload-cv/types";

interface GeneratePdfRequest {
  resumeData: ResumeData;
  template?: TemplateType;
  color?: string;
  filename?: string;
}

export async function POST(request: NextRequest) {
  let browser;

  try {
    const body: GeneratePdfRequest = await request.json();

    const {
      resumeData,
      template = "modern",
      color = "#000000",
      filename = "resume",
    } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 },
      );
    }

    // Generate HTML from resume data
    const html = renderResumeHtml(resumeData, template, color);

    // Launch browser with Docker-compatible configuration
    browser = await puppeteer.launch({
      // Use installed browser in Docker
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        "/usr/bin/google-chrome" ||
        "/usr/bin/chromium",

      // Required args for Docker
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Fixes crashes in low-memory Docker containers
      ],
      headless: true,
      defaultViewport: {
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
      },
    });

    const page = await browser.newPage();

    // Set content with wait for fonts
    await page.setContent(html, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });

    // Wait for fonts to fully load
    await page.evaluateHandle("document.fonts.ready");

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
      preferCSSPageSize: true,
    });

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    if (browser) await browser.close();
  }
}
