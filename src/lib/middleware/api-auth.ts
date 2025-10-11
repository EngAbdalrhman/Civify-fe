import { NextRequest, NextResponse } from "next/server";
import {
  serverDatabases,
  Query,
  DATABASE_ID,
  USERS_COLLECTION_ID,
  API_KEYS_COLLECTION_ID,
} from "@/lib/appwrite-server";
import { verifyApiKey } from "@/lib/utils/license";
import { UserProfile } from "@/lib/types";

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  userProfile?: UserProfile;
}

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  error?: string;
  status?: number;
}

/**
 * Middleware to authenticate API requests using API keys
 */
export async function authenticateApiRequest(
  request: NextRequest
): Promise<AuthResult> {
  // Get API key from Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      error: "Missing or invalid Authorization header",
      status: 401,
    };
  }

  const apiKey = authHeader.substring(7); // Remove "Bearer " prefix

  if (!apiKey || !apiKey.startsWith("hicv_live_")) {
    return {
      authenticated: false,
      error: "Invalid API key format",
      status: 401,
    };
  }

  try {
    // Get all API keys
    const apiKeysResponse = await serverDatabases.listDocuments(
      DATABASE_ID,
      API_KEYS_COLLECTION_ID,
      [Query.equal("isActive", true), Query.limit(10000)]
    );

    // Check each API key
    for (const apiKeyDoc of apiKeysResponse.documents) {
      const isValid = await verifyApiKey(apiKey, apiKeyDoc.keyHash);

      if (isValid) {
        // Get userId from the relationship field
        const userId = apiKeyDoc.users;

        // Get user document by ID (document ID is the Firebase userId)
        try {
          const userDoc = await serverDatabases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId
          );

          if (!userDoc) {
            return {
              authenticated: false,
              error: "User not found",
              status: 401,
            };
          }

          // Check if user is licensed
          if (!userDoc.isLicensed) {
            return {
              authenticated: false,
              error: "API access requires an active license",
              status: 403,
            };
          }

          // Check rate limit
          const currentMonth = new Date().toISOString().substring(0, 7);
          const apiUsageMonth = userDoc.apiUsageMonth;
          const apiUsageCount = userDoc.apiUsageCount || 0;
          const apiRateLimit = userDoc.apiRateLimit || 500; // Custom or default limit

          if (apiUsageMonth === currentMonth && apiUsageCount >= apiRateLimit) {
            return {
              authenticated: false,
              error: `API rate limit exceeded (${apiRateLimit} calls/month)`,
              status: 429,
            };
          }

          // Update last used timestamp
          await serverDatabases.updateDocument(
            DATABASE_ID,
            API_KEYS_COLLECTION_ID,
            apiKeyDoc.$id,
            {
              lastUsedAt: new Date().toISOString(),
            }
          );

          return {
            authenticated: true,
            userId,
            status: 200,
          };
        } catch (userError) {
          console.error("Error getting user document:", userError);
          return {
            authenticated: false,
            error: "User not found",
            status: 401,
          };
        }
      }
    }

    return {
      authenticated: false,
      error: "Invalid API key",
      status: 401,
    };
  } catch (error) {
    console.error("Error authenticating API request:", error);
    return {
      authenticated: false,
      error: "Authentication failed",
      status: 500,
    };
  }
}

/**
 * Helper function to create error responses
 */
export function createErrorResponse(
  message: string,
  status: number = 401
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

/**
 * Helper function to create success responses
 */
export function createSuccessResponse<T>(data: T): NextResponse {
  return NextResponse.json({
    success: true,
    data,
  });
}
