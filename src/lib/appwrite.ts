"use client";

import { Client, Storage, ID } from "appwrite";

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

export const storage = new Storage(client);
export const CV_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "";

/**
 * Upload a CV file to Appwrite Storage
 * @param file - The file to upload
 * @param userId - The user ID for organizing files
 * @returns The file ID
 */
export async function uploadCVFile(
  file: File,
  userId: string
): Promise<string> {
  try {
    const fileId = ID.unique();
    const response = await storage.createFile(CV_BUCKET_ID, fileId, file);
    return response.$id;
  } catch (error) {
    console.error("Error uploading CV file to Appwrite:", error);
    throw new Error("Failed to upload CV file");
  }
}

/**
 * Download a CV file from Appwrite Storage
 * @param fileId - The file ID
 * @returns The file as a Blob
 */
export async function getCVFile(fileId: string): Promise<Blob> {
  try {
    const result = await storage.getFileDownload(CV_BUCKET_ID, fileId);
    // The result is already a Blob from Appwrite SDK
    return result as unknown as Blob;
  } catch (error) {
    console.error("Error downloading CV file from Appwrite:", error);
    throw new Error("Failed to download CV file");
  }
}

/**
 * Get CV file content as text
 * @param fileId - The file ID
 * @returns The file content as text
 */
export async function getCVFileAsText(fileId: string): Promise<string> {
  try {
    const blob = await getCVFile(fileId);
    return await blob.text();
  } catch (error) {
    console.error("Error reading CV file content:", error);
    throw new Error("Failed to read CV file content");
  }
}

/**
 * Delete a CV file from Appwrite Storage
 * @param fileId - The file ID
 */
export async function deleteCVFile(fileId: string): Promise<void> {
  try {
    await storage.deleteFile(CV_BUCKET_ID, fileId);
  } catch (error) {
    console.error("Error deleting CV file from Appwrite:", error);
    throw new Error("Failed to delete CV file");
  }
}

/**
 * Get a preview URL for a CV file
 * @param fileId - The file ID
 * @returns The preview URL
 */
export async function getCVFilePreviewURL(fileId: string): Promise<string> {
  try {
    const result = storage.getFilePreview(CV_BUCKET_ID, fileId);
    return result.toString();
  } catch (error) {
    console.error("Error getting CV file preview URL:", error);
    throw new Error("Failed to get CV file preview URL");
  }
}
