"use client";

import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import type { LicenseKey, UserProfile, AdminStats } from "@/lib/types";

// Environment variables
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const CVS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CVS_COLLECTION_ID!;
const LICENSES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_LICENSES_COLLECTION_ID!;
const API_KEYS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_API_KEYS_COLLECTION_ID!;
const API_USAGE_LOGS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_API_USAGE_LOGS_COLLECTION_ID!;

/**
 * Appwrite Admin Database Service
 * Admin-specific database operations
 */
export class AppwriteAdminDatabaseService {
  // ==================== LICENSE MANAGEMENT ====================

  /**
   * Create a new license key
   */
  async createLicenseKey(licenseKey: Omit<LicenseKey, "id">): Promise<string> {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        LICENSES_COLLECTION_ID,
        ID.unique(),
        {
          key: licenseKey.key,
          createdAt: licenseKey.createdAt, // Manual timestamp for admin tracking
          createdBy: licenseKey.createdBy,
          isActive: licenseKey.isActive,
          notes: (licenseKey as any).notes || "",
        }
      );

      return doc.$id;
    } catch (error) {
      console.error("Error creating license key:", error);
      throw error;
    }
  }

  /**
   * Get all license keys
   */
  async getAllLicenses(): Promise<LicenseKey[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        LICENSES_COLLECTION_ID,
        [Query.orderDesc("$createdAt"), Query.limit(1000)]
      );

      return response.documents.map((doc: any) => ({
        id: doc.$id,
        key: doc.key,
        createdAt: doc.createdAt, // Manual field set by admin
        createdBy: doc.createdBy,
        activatedBy: doc.activatedBy,
        activatedAt: doc.activatedAt,
        isActive: doc.isActive,
        notes: doc.notes,
      }));
    } catch (error) {
      console.error("Error getting licenses:", error);
      return [];
    }
  }

  /**
   * Revoke a license
   */
  async revokeLicense(licenseId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        LICENSES_COLLECTION_ID,
        licenseId,
        { isActive: false }
      );
    } catch (error) {
      console.error("Error revoking license:", error);
      throw error;
    }
  }

  /**
   * Activate a license
   */
  async activateLicense(licenseId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        LICENSES_COLLECTION_ID,
        licenseId,
        { isActive: true }
      );
    } catch (error) {
      console.error("Error activating license:", error);
      throw error;
    }
  }

  /**
   * Delete a license
   */
  async deleteLicense(licenseId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        LICENSES_COLLECTION_ID,
        licenseId
      );
    } catch (error) {
      console.error("Error deleting license:", error);
      throw error;
    }
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users
   */
  async getAllUsers(): Promise<Array<UserProfile & { userId: string }>> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.orderDesc("$createdAt"), Query.limit(1000)]
      );

      return response.documents.map((doc: any) => ({
        userId: doc.$id, // Document ID is the Firebase userId
        name: doc.name || "",
        email: doc.email || "",
        phone: doc.phone || "",
        summary: doc.summary || "",
        experience: doc.experience || "",
        education: doc.education || "",
        skills: doc.skills || "",
        isAdmin: doc.isAdmin || false,
        isLicensed: doc.isLicensed || false,
        licenseKey: doc.licenseKey,
        licenseActivatedAt: doc.licenseActivatedAt,
        apiKeyHash: doc.apiKeyHash,
        apiUsage: doc.apiUsageMonth
          ? {
              month: doc.apiUsageMonth,
              count: doc.apiUsageCount || 0,
            }
          : undefined,
        cvCount: doc.cvCount || 0,
        cvLimit: doc.cvLimit || 3,
      }));
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId // Document ID is the Firebase userId
      );

      return {
        name: doc.name || "",
        email: doc.email || "",
        phone: doc.phone || "",
        summary: doc.summary || "",
        experience: doc.experience || "",
        education: doc.education || "",
        skills: doc.skills || "",
        isAdmin: doc.isAdmin || false,
        isLicensed: doc.isLicensed || false,
        licenseKey: doc.licenseKey,
        licenseActivatedAt: doc.licenseActivatedAt,
        apiKeyHash: doc.apiKeyHash,
        apiUsage: doc.apiUsageMonth
          ? {
              month: doc.apiUsageMonth,
              count: doc.apiUsageCount || 0,
            }
          : undefined,
        cvCount: doc.cvCount || 0,
        cvLimit: doc.cvLimit || 3,
        apiUsageMonth: doc.apiUsageMonth,
        apiUsageCount: doc.apiUsageCount || 0,
        apiRateLimit: doc.apiRateLimit || 500,
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  /**
   * Grant license to user
   */
  async grantLicense(userId: string, licenseKey: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId, // Document ID is the Firebase userId
        {
          isLicensed: true,
          licenseKey: licenseKey,
          licenseActivatedAt: new Date().toISOString(),
          // $updatedAt is auto-generated by Appwrite
        }
      );
    } catch (error) {
      console.error("Error granting license:", error);
      throw error;
    }
  }

  /**
   * Revoke license from user
   */
  async revokeLicenseFromUser(userId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId, // Document ID is the Firebase userId
        {
          isLicensed: false,
          licenseKey: null,
          licenseActivatedAt: null,
          // $updatedAt is auto-generated by Appwrite
        }
      );
    } catch (error) {
      console.error("Error revoking license from user:", error);
      throw error;
    }
  }

  /**
   * Set custom CV limit for user
   */
  async setUserCVLimit(userId: string, limit: number): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId, // Document ID is the Firebase userId
        {
          cvLimit: limit,
          // $updatedAt is auto-generated by Appwrite
        }
      );
    } catch (error) {
      console.error("Error setting CV limit:", error);
      throw error;
    }
  }

  /**
   * Set custom API rate limit for user (calls per month)
   */
  async setUserApiLimit(userId: string, limit: number): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId, // Document ID is the Firebase userId
        {
          apiRateLimit: limit,
          // $updatedAt is auto-generated by Appwrite
        }
      );
    } catch (error) {
      console.error("Error setting API rate limit:", error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId // Document ID is the Firebase userId
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Make user admin
   */
  async makeAdmin(userId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId, // Document ID is the Firebase userId
        {
          isAdmin: true,
          // $updatedAt is auto-generated by Appwrite
        }
      );
    } catch (error) {
      console.error("Error making user admin:", error);
      throw error;
    }
  }

  /**
   * Remove admin privileges
   */
  async removeAdmin(userId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId, // Document ID is the Firebase userId
        {
          isAdmin: false,
          // $updatedAt is auto-generated by Appwrite
        }
      );
    } catch (error) {
      console.error("Error removing admin:", error);
      throw error;
    }
  }

  // ==================== STATISTICS ====================

  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<AdminStats> {
    try {
      const [users, cvs, licenses, apiLogs] = await Promise.all([
        databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
          Query.limit(10000),
        ]),
        databases.listDocuments(DATABASE_ID, CVS_COLLECTION_ID, [
          Query.limit(10000),
        ]),
        databases.listDocuments(DATABASE_ID, LICENSES_COLLECTION_ID, [
          Query.limit(10000),
        ]),
        databases.listDocuments(DATABASE_ID, API_USAGE_LOGS_COLLECTION_ID, [
          Query.limit(10000),
        ]),
      ]);

      const currentMonth = new Date().toISOString().substring(0, 7);
      const apiCallsThisMonth = apiLogs.documents.filter(
        (log: any) => log.month === currentMonth
      ).length;

      const licensedUsers = users.documents.filter(
        (user: any) => user.isLicensed
      ).length;

      const activeLicenses = licenses.documents.filter(
        (license: any) => license.isActive && license.activatedBy
      ).length;

      const unusedLicenses = licenses.documents.filter(
        (license: any) => license.isActive && !license.activatedBy
      ).length;

      return {
        totalUsers: users.total,
        licensedUsers,
        totalCVs: cvs.total,
        totalApiCalls: apiLogs.total,
        apiCallsThisMonth,
        activeLicenses,
        unusedLicenses,
      };
    } catch (error) {
      console.error("Error getting admin stats:", error);
      throw error;
    }
  }

  /**
   * Get user CV count
   */
  async getUserCVCount(userId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        CVS_COLLECTION_ID,
        [Query.equal("userId", [userId])] // Relation query
      );

      return response.total;
    } catch (error) {
      console.error("Error getting user CV count:", error);
      return 0;
    }
  }

  /**
   * Get user API usage
   */
  async getUserApiUsage(userId: string): Promise<number> {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7);
      const response = await databases.listDocuments(
        DATABASE_ID,
        API_USAGE_LOGS_COLLECTION_ID,
        [Query.equal("userId", [userId]), Query.equal("month", currentMonth)] // Relation query
      );

      return response.total;
    } catch (error) {
      console.error("Error getting user API usage:", error);
      return 0;
    }
  }
}
