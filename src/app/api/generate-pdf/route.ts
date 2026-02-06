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

// ---------------------------------------------------------------------------
// Shared singleton browser instance
// ---------------------------------------------------------------------------
let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  // If we already have a connected browser, reuse it
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  // If a launch is already in progress, wait for it (prevents parallel launches)
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

    // Auto-clear reference when the browser disconnects / crashes
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
export async function POST(req: NextRequest) {
  let page: Awaited<ReturnType<Browser["newPage"]>> | null = null;

  try {
    // Parse the request body
    const body = await req.json();
    const { html } = body;

    // 1. Input Validation
    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { error: 'Invalid input: "html" string is required.' },
        { status: 400 },
      );
    }

    // Get the shared browser and open a new page (tab) — NOT a new process
    const browser = await getBrowser();
    page = await browser.newPage();

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
        "Content-Disposition": 'attachment; filename="cv.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
        // Cache-Control: Prevent caching of dynamic user data
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
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
    // Close only the page (tab), not the browser
    if (page) {
      try {
        await page.close();
      } catch {
        // Page may already be closed if browser crashed — ignore
      }
    }
  }
}
