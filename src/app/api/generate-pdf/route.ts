/**
 * PDF Generation API Route using Puppeteer
 *
 * This route renders resume HTML using headless Chrome and returns a high-quality PDF
 * with selectable text (ATS friendly) and identical rendering to browser preview.
 *
 * In development (Windows/Mac), uses the system-installed Chrome.
 * In production (Linux containers), uses @sparticuz/chromium.
 */

import { NextRequest, NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import {
  renderResumeHtml,
  type TemplateType,
} from "@/features/resume-builder/utils/renderResumeHtml";
import type { ResumeData } from "@/features/upload-cv/types";

const isDev = process.env.NODE_ENV === "development";

/**
 * Get Chrome executable path based on environment
 * - Development: Use locally installed Chrome
 * - Production: Use @sparticuz/chromium bundled binary
 */
async function getChromePath(): Promise<string> {
  if (isDev) {
    // Common Chrome paths for different OS
    const possiblePaths = [
      // Windows
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
      // Mac
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      // Linux
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
    ];

    // Try to find Chrome
    for (const chromePath of possiblePaths) {
      try {
        const fs = await import("fs");
        if (fs.existsSync(chromePath)) {
          return chromePath;
        }
      } catch {
        continue;
      }
    }

    throw new Error(
      "Chrome not found. Please install Google Chrome for local development.",
    );
  }

  // Production: use system chromium if PUPPETEER_EXECUTABLE_PATH is set (Docker),
  // otherwise fall back to @sparticuz/chromium
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  return await chromium.executablePath();
}

interface GeneratePdfRequest {
  resumeData: ResumeData;
  template?: TemplateType;
  color?: string;
  filename?: string;
}

export async function POST(request: NextRequest) {
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

    // Launch Puppeteer with environment-appropriate Chrome
    const executablePath = await getChromePath();

    // Use consistent args for all environments (system chromium or @sparticuz/chromium)
    const chromiumArgs = [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
      "--no-zygote",
    ];

    const browser = await puppeteerCore.launch({
      args: chromiumArgs,
      executablePath,
      headless: true,
      defaultViewport: {
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
      },
    });

    try {
      const page = await browser.newPage();

      // Set content with wait for fonts
      await page.setContent(html, {
        waitUntil: ["networkidle0", "domcontentloaded"],
      });

      // Wait a bit for fonts to fully load
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

      // Close browser
      await browser.close();

      // Return PDF as response - convert Uint8Array to Buffer for NextResponse
      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}.pdf"`,
          "Content-Length": pdfBuffer.length.toString(),
        },
      });
    } catch (error) {
      await browser.close();
      throw error;
    }
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
