import { NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * GET /api/health
 * 
 * Returns server status and environment configuration (without exposing secrets)
 */
export async function GET() {
  try {
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || "unknown",
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        hasGoogleKey: !!process.env.GOOGLE_API_KEY,
        hasAppwriteEndpoint: !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
        hasAppwriteProject: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
        hasAppwriteApiKey: !!process.env.APPWRITE_API_KEY,
        hasAppwriteDatabase: !!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        hasUsersCollection: !!process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
        hasApiKeysCollection: !!process.env.NEXT_PUBLIC_APPWRITE_API_KEYS_COLLECTION_ID,
        hasApiUsageLogsCollection: !!process.env.NEXT_PUBLIC_APPWRITE_API_USAGE_LOGS_COLLECTION_ID,
      },
      runtime: {
        platform: process.platform,
        nodeVersion: process.version,
        arch: process.arch,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

