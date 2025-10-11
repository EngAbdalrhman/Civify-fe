/**
 * Server-side Appwrite configuration
 * This file is used in API routes and server-side code
 * DO NOT add "use client" directive to this file
 */

import { Client, Databases, Storage, Query, ID } from "appwrite";

// Initialize Appwrite client for server-side use
function createServerClient() {
  const client = new Client();

  client
    .setEndpoint(
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
    )
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

  return client;
}

// Create singleton instances
const serverClient = createServerClient();
export const serverDatabases = new Databases(serverClient);
export const serverStorage = new Storage(serverClient);

// Export Query and ID for convenience
export { Query, ID };

// Export collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
export const CVS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CVS_COLLECTION_ID!;
export const LICENSES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_LICENSES_COLLECTION_ID!;
export const API_KEYS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_API_KEYS_COLLECTION_ID!;
export const API_USAGE_LOGS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_API_USAGE_LOGS_COLLECTION_ID!;
export const JOB_APPLICATIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_JOB_APPLICATIONS_COLLECTION_ID!;
export const CV_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "";

