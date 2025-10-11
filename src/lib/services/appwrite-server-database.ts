/**
 * Server-side Appwrite Database Service
 * For use in API routes and server-side code
 * DO NOT add "use client" directive
 */

import {
  serverDatabases,
  ID,
  DATABASE_ID,
  USERS_COLLECTION_ID,
  API_USAGE_LOGS_COLLECTION_ID,
} from "@/lib/appwrite-server";

export interface ApiUsageLog {
  endpoint: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Log API usage to Appwrite
 */
export async function logApiUsage(
  userId: string,
  log: ApiUsageLog
): Promise<void> {
  try {
    // Create API usage log
    await serverDatabases.createDocument(
      DATABASE_ID,
      API_USAGE_LOGS_COLLECTION_ID,
      ID.unique(),
      {
        users: userId, // Relationship to users collection
        endpoint: log.endpoint,
        timestamp: log.timestamp,
        success: log.success,
        errorMessage: log.errorMessage || null,
      }
    );

    // Update user's API usage count
    const currentMonth = new Date().toISOString().substring(0, 7);

    // Get current user document
    const userDoc = await serverDatabases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    );

    const apiUsageMonth = userDoc.apiUsageMonth;
    const apiUsageCount = userDoc.apiUsageCount || 0;

    // If it's a new month, reset the counter
    if (apiUsageMonth !== currentMonth) {
      await serverDatabases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          apiUsageMonth: currentMonth,
          apiUsageCount: 1,
        }
      );
    } else {
      // Increment the counter
      await serverDatabases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          apiUsageCount: apiUsageCount + 1,
        }
      );
    }
  } catch (error) {
    console.error("Error logging API usage:", error);
    // Don't throw - we don't want to fail the API request if logging fails
  }
}

/**
 * Get user's API usage for current month
 */
export async function getApiUsageThisMonth(userId: string): Promise<number> {
  try {
    const userDoc = await serverDatabases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    );

    const currentMonth = new Date().toISOString().substring(0, 7);
    const apiUsageMonth = userDoc.apiUsageMonth;
    const apiUsageCount = userDoc.apiUsageCount || 0;

    if (apiUsageMonth === currentMonth) {
      return apiUsageCount;
    }

    return 0;
  } catch (error) {
    console.error("Error getting API usage:", error);
    return 0;
  }
}

