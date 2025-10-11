import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { verifyApiKey } from "@/lib/utils/license";
import { UserProfile } from "@/lib/types";

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  userProfile?: UserProfile;
}

/**
 * Middleware to authenticate API requests using API keys
 */
export async function authenticateApiRequest(
  request: NextRequest
): Promise<{ authenticated: boolean; userId?: string; error?: string }> {
  // Get API key from Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      error: "Missing or invalid Authorization header",
    };
  }

  const apiKey = authHeader.substring(7); // Remove "Bearer " prefix

  if (!apiKey || !apiKey.startsWith("hicv_live_")) {
    return {
      authenticated: false,
      error: "Invalid API key format",
    };
  }

  try {
    // Search for the API key in all users
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      return {
        authenticated: false,
        error: "Invalid API key",
      };
    }

    const usersData = snapshot.val();

    for (const userId in usersData) {
      const user = usersData[userId];
      const profile = user.profile as UserProfile;

      if (profile?.apiKeyHash) {
        const isValid = await verifyApiKey(apiKey, profile.apiKeyHash);

        if (isValid) {
          // Check if user is licensed
          if (!profile.isLicensed) {
            return {
              authenticated: false,
              error: "API access requires an active license",
            };
          }

          // Check rate limit
          const currentMonth = new Date().toISOString().substring(0, 7);
          const apiUsage = profile.apiUsage;

          if (apiUsage?.month === currentMonth && apiUsage.count >= 500) {
            return {
              authenticated: false,
              error: "API rate limit exceeded (500 calls/month)",
            };
          }

          return {
            authenticated: true,
            userId,
          };
        }
      }
    }

    return {
      authenticated: false,
      error: "Invalid API key",
    };
  } catch (error) {
    console.error("Error authenticating API request:", error);
    return {
      authenticated: false,
      error: "Authentication failed",
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

