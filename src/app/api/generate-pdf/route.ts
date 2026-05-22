/**
 * PDF Generation API Route using Puppeteer
 *
 * Uses a shared singleton Chromium instance — each request opens a new page (tab),
 * not a new browser process. The browser auto-recovers if it crashes or disconnects.
 *
 * Uses installed browser in Docker container with required args for Docker environment.
 */

import { NextRequest, NextResponse } from "next/server";
import puppeteer, { type Browser } from "puppeteer-core";
import {
  renderResumeHtml,
  type TemplateType,
} from "@/features/resume-builder/utils/renderResumeHtml";
import type { WatermarkConfig } from "@/features/resume-builder/types/watermark";
import type { ResumeData } from "@/features/upload-cv/types";
import { resolveWatermarkForRequest } from "@/lib/watermark/resolveWatermark";

// ---------------------------------------------------------------------------
// Shared singleton browser instance
// ---------------------------------------------------------------------------
let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  browserLaunchPromise = (async () => {
    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium";

    const browser = await puppeteer.launch({
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--font-render-hinting=none",
        "--crash-dumps-dir=/tmp/chromium-crashes",
        "--user-data-dir=/tmp/chromium-data",
        "--disable-crash-reporter",
        "--disable-breakpad",
      ],
      headless: true,
      timeout: 30000,
      defaultViewport: {
        width: 794,
        height: 1123,
      },
    });

    browser.on("disconnected", () => {
      browserInstance = null;
      browserLaunchPromise = null;
    });

    browserInstance = browser;
    browserLaunchPromise = null;
    return browser;
  })();

  return browserLaunchPromise;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
interface GeneratePdfRequest {
  resumeData: ResumeData;
  template?: TemplateType;
  color?: string;
  filename?: string;
  watermark?: WatermarkConfig;
}

export async function POST(request: NextRequest) {
  let page: Awaited<ReturnType<Browser["newPage"]>> | null = null;

  try {
    const body: GeneratePdfRequest = await request.json();

    const {
      resumeData,
      template = "modern",
      color = "#000000",
      filename = "resume",
      watermark: bodyWatermark,
    } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 },
      );
    }

    const watermark = await resolveWatermarkForRequest(request, bodyWatermark);
    const html = renderResumeHtml(resumeData, template, color, watermark);

    const browser = await getBrowser();
    page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });

    await page.evaluateHandle("document.fonts.ready");

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

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}.pdf`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("PDF generation error:", errorMessage);
    console.error("Full error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: errorMessage,
      },
      { status: 500 },
    );
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {
        // Page may already be closed if browser crashed — ignore
      }
    }
  }
}
