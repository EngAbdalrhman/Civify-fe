import puppeteer from "puppeteer-core";

/**
 * Determines the correct path to the browser executable based on the environment.
 * In production (Docker), this is explicitly set via ENV variables.
 * In local dev, we attempt to locate the standard Chrome installation.
 */
const getExecutablePath = () => {
  // Ideally, set PUPPETEER_EXECUTABLE_PATH in.env.local for dev
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const platform = process.platform;
  if (platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  } else if (platform === "win32") {
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }

  // Default fallback for Linux
  return "/usr/bin/google-chrome-stable";
};

interface PdfOptions {
  html: string;
}

export async function generateCvPdf({ html }: PdfOptions): Promise<Buffer> {
  let browser = null;
  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      executablePath: getExecutablePath(),
      // Optimized args for Docker execution
      args: [
        "--disable-gpu", // Software rendering is more stable headless
        "--font-render-hinting=none", // Improve font kerning [16]
        "--disable-extensions",
        "--disable-background-networking",
      ],
      headless: true,
      // DumpIO: false prevents massive console spam, set to true for debugging
      dumpio: false,
    });

    const page = await browser.newPage();

    // Set a standard viewport to ensure CSS media queries behave predictably
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 });

    // Load content. 'networkidle0' is critical: it waits until there are no
    // more than 0 network connections for at least 500ms.
    // This ensures fonts and images are fully loaded before printing.
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000, // 30s timeout
    });

    console.log("Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // Essential for CVs with colored headers/sidebars
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "10mm",
        right: "10mm",
      },
      preferCSSPageSize: true, // Respect @page CSS rules
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("PDF Generation Failed:", error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  } finally {
    if (browser) {
      // Vital: Ensure the browser process is killed to prevent zombie processes
      await browser.close();
    }
  }
}
