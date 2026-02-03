/**
 * PDF Generation API Route using Puppeteer
 *
 * This route renders resume HTML using headless Chrome and returns a high-quality PDF
 * with selectable text (ATS friendly) and identical rendering to browser preview.
 *
 * In development: Uses regular puppeteer with bundled Chromium
 * In production: Uses @sparticuz/chromium-min with hosted Chromium binary
 */

import { NextRequest, NextResponse } from "next/server";
import {
  renderResumeHtml,
  type TemplateType,
} from "@/features/resume-builder/utils/renderResumeHtml";
import type { ResumeData } from "@/features/upload-cv/types";

// URL to the Chromium binary package hosted in /public
// Falls back to an example URL if VERCEL_PROJECT_PRODUCTION_URL is not set
const CHROMIUM_PACK_URL = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/chromium-pack.tar`
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/chromium-pack.tar`
    : "https://github.com/gabenunez/puppeteer-on-vercel/raw/refs/heads/main/example/chromium-dont-use-in-prod.tar";

// Cache the Chromium executable path to avoid re-downloading on subsequent requests
let cachedExecutablePath: string | null = null;
let downloadPromise: Promise<string> | null = null;

/**
 * Downloads and caches the Chromium executable path for production.
 * Uses a download promise to prevent concurrent downloads.
 */
async function getChromiumPath(): Promise<string> {
  // Return cached path if available
  if (cachedExecutablePath) return cachedExecutablePath;

  // Prevent concurrent downloads by reusing the same promise
  if (!downloadPromise) {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    downloadPromise = chromium
      .executablePath(CHROMIUM_PACK_URL)
      .then((path: string) => {
        cachedExecutablePath = path;
        console.log("Chromium path resolved:", path);
        return path;
      })
      .catch((error: Error) => {
        console.error("Failed to get Chromium path:", error);
        downloadPromise = null; // Reset on error to allow retry
        throw error;
      });
  }

  return downloadPromise;
}

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

    // Configure browser based on environment
    const isProduction = process.env.NODE_ENV === "production";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let puppeteer: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let launchOptions: any = {
      headless: true,
      defaultViewport: {
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
      },
    };

    if (isProduction) {
      // Production: Use puppeteer-core with downloaded Chromium binary
      const chromium = (await import("@sparticuz/chromium-min")).default;
      puppeteer = await import("puppeteer-core");
      const executablePath = await getChromiumPath();
      launchOptions = {
        ...launchOptions,
        args: chromium.args,
        executablePath,
      };
      console.log("Launching browser with executable path:", executablePath);
    } else {
      // Local: Use regular puppeteer with bundled Chromium
      puppeteer = await import("puppeteer");
    }

    // Launch browser and generate PDF
    browser = await puppeteer.launch(launchOptions);
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

    // Close browser
    await browser.close();

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
    // Always clean up browser resources
    if (browser) {
      await browser.close();
    }
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
