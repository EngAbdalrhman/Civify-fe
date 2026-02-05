import { generateCvPdf } from "@/services/pdf-generation.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    // 2. Generate PDF
    // Note: In a high-traffic production app, this should be offloaded
    // to a job queue (Bull/Redis) to prevent request timeouts.
    const pdfBuffer = await generateCvPdf({ html });

    // 3. Return Response
    return new NextResponse(new Uint8Array(pdfBuffer), {
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
    console.error("API Handler Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
