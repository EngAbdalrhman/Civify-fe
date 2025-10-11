"use client";

import { db } from "@/lib/firebase";
import { ref, set, get, push, update, remove } from "firebase/database";
import { LicenseKey, UserProfile, ApiUsageLog, AdminStats } from "@/lib/types";

// Admin-specific database service
export class AdminDatabaseService {
  // License Management
  async createLicenseKey(licenseKey: LicenseKey): Promise<string> {
    const licensesRef = ref(db, "licenses");
    const newLicenseRef = push(licensesRef);
    const licenseId = newLicenseRef.key!;

    await set(newLicenseRef, {
      ...licenseKey,
      id: licenseId,
    });

    return licenseId;
  }

  async getAllLicenses(): Promise<LicenseKey[]> {
    const licensesRef = ref(db, "licenses");
    const snapshot = await get(licensesRef);
    if (!snapshot.exists()) return [];

    const licensesData = snapshot.val();
    return Object.values(licensesData) as LicenseKey[];
  }

  async revokeLicense(licenseId: string): Promise<void> {
    const licenseRef = ref(db, `licenses/${licenseId}`);
    await update(licenseRef, { isActive: false });
  }

  async activateLicense(licenseId: string): Promise<void> {
    const licenseRef = ref(db, `licenses/${licenseId}`);
    await update(licenseRef, { isActive: true });
  }

  async deleteLicense(licenseId: string): Promise<void> {
    const licenseRef = ref(db, `licenses/${licenseId}`);
    await remove(licenseRef);
  }

  // User Management
  async getAllUsers(): Promise<Array<UserProfile & { userId: string }>> {
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);
    if (!snapshot.exists()) return [];

    const usersData = snapshot.val();
    const users: Array<UserProfile & { userId: string }> = [];

    for (const userId in usersData) {
      const profile = usersData[userId].profile;
      if (profile) {
        users.push({
          ...profile,
          userId,
          email: profile.email || userId,
        });
      }
    }

    return users;
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    const profileRef = ref(db, `users/${userId}/profile`);
    const snapshot = await get(profileRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  async grantLicense(userId: string): Promise<void> {
    const profileRef = ref(db, `users/${userId}/profile`);
    await update(profileRef, {
      isLicensed: true,
      licenseActivatedAt: new Date().toISOString(),
    });
  }

  async revokeLicenseFromUser(userId: string): Promise<void> {
    const profileRef = ref(db, `users/${userId}/profile`);
    await update(profileRef, {
      isLicensed: false,
    });
  }

  async deleteUser(userId: string): Promise<void> {
    const userRef = ref(db, `users/${userId}`);
    await remove(userRef);
  }

  async makeAdmin(userId: string): Promise<void> {
    const profileRef = ref(db, `users/${userId}/profile`);
    await update(profileRef, {
      isAdmin: true,
    });
  }

  async removeAdmin(userId: string): Promise<void> {
    const profileRef = ref(db, `users/${userId}/profile`);
    await update(profileRef, {
      isAdmin: false,
    });
  }

  async getUserCVCount(userId: string): Promise<number> {
    const cvsRef = ref(db, `users/${userId}/cvs`);
    const snapshot = await get(cvsRef);
    if (!snapshot.exists()) return 0;

    const cvsData = snapshot.val();
    return Object.keys(cvsData).length;
  }

  async getUserApiUsage(userId: string): Promise<number> {
    const profileRef = ref(db, `users/${userId}/profile`);
    const snapshot = await get(profileRef);
    if (!snapshot.exists()) return 0;

    const profile = snapshot.val();
    const currentMonth = new Date().toISOString().substring(0, 7);

    if (profile?.apiUsage?.month === currentMonth) {
      return profile.apiUsage.count || 0;
    }

    return 0;
  }

  // Statistics
  async getAdminStats(): Promise<AdminStats> {
    const usersRef = ref(db, "users");
    const licensesRef = ref(db, "licenses");

    const [usersSnapshot, licensesSnapshot] = await Promise.all([
      get(usersRef),
      get(licensesRef),
    ]);

    let totalUsers = 0;
    let licensedUsers = 0;
    let totalCVs = 0;
    let totalApiCalls = 0;
    let apiCallsThisMonth = 0;

    const currentMonth = new Date().toISOString().substring(0, 7);

    if (usersSnapshot.exists()) {
      const usersData = usersSnapshot.val();
      totalUsers = Object.keys(usersData).length;

      for (const userId in usersData) {
        const user = usersData[userId];
        if (user.profile?.isLicensed) licensedUsers++;
        if (user.cvs) totalCVs += Object.keys(user.cvs).length;
        if (user.apiUsageLogs) {
          const logs = Object.values(user.apiUsageLogs) as ApiUsageLog[];
          totalApiCalls += logs.length;
          apiCallsThisMonth += logs.filter(
            (log) => log.month === currentMonth
          ).length;
        }
      }
    }

    let activeLicenses = 0;
    let unusedLicenses = 0;

    if (licensesSnapshot.exists()) {
      const licensesData = licensesSnapshot.val();
      const licenses = Object.values(licensesData) as LicenseKey[];

      activeLicenses = licenses.filter(
        (l) => l.isActive && l.activatedBy
      ).length;
      unusedLicenses = licenses.filter(
        (l) => l.isActive && !l.activatedBy
      ).length;
    }

    return {
      totalUsers,
      licensedUsers,
      totalCVs,
      totalApiCalls,
      apiCallsThisMonth,
      activeLicenses,
      unusedLicenses,
    };
  }

  // Migration Utilities
  /**
   * Truncate old CVs without fileId (pre-Appwrite migration)
   * This will delete all CVs that don't have a fileId field
   * @returns Object with counts of deleted CVs per user
   */
  async truncateOldCVs(): Promise<{
    totalDeleted: number;
    usersAffected: number;
    details: { userId: string; email: string; deletedCount: number }[];
  }> {
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      return { totalDeleted: 0, usersAffected: 0, details: [] };
    }

    const usersData = snapshot.val();
    let totalDeleted = 0;
    let usersAffected = 0;
    const details: { userId: string; email: string; deletedCount: number }[] =
      [];

    for (const [userId, userData] of Object.entries(
      usersData as Record<string, any>
    )) {
      const cvs = (userData as any).cvs || {};
      let userDeletedCount = 0;

      for (const [cvId, cvData] of Object.entries(cvs as Record<string, any>)) {
        // Delete CVs without fileId (old format)
        if (!(cvData as any).fileId) {
          const cvRef = ref(db, `users/${userId}/cvs/${cvId}`);
          await remove(cvRef);
          userDeletedCount++;
          totalDeleted++;
        }
      }

      if (userDeletedCount > 0) {
        usersAffected++;
        details.push({
          userId,
          email: (userData as any).profile?.email || "Unknown",
          deletedCount: userDeletedCount,
        });

        // Update CV count for user
        const remainingCVs = Object.values(cvs).filter(
          (cv: any) => cv.fileId
        ).length;
        const profileRef = ref(db, `users/${userId}/profile`);
        await update(profileRef, { cvCount: remainingCVs });
      }
    }

    return { totalDeleted, usersAffected, details };
  }

  /**
   * Get count of old CVs without fileId
   * @returns Count of old CVs per user
   */
  async getOldCVsCount(): Promise<{
    totalOldCVs: number;
    usersWithOldCVs: number;
    details: { userId: string; email: string; oldCVCount: number }[];
  }> {
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      return { totalOldCVs: 0, usersWithOldCVs: 0, details: [] };
    }

    const usersData = snapshot.val();
    let totalOldCVs = 0;
    let usersWithOldCVs = 0;
    const details: { userId: string; email: string; oldCVCount: number }[] = [];

    for (const [userId, userData] of Object.entries(
      usersData as Record<string, any>
    )) {
      const cvs = (userData as any).cvs || {};
      let userOldCVCount = 0;

      for (const cvData of Object.values(cvs as Record<string, any>)) {
        if (!(cvData as any).fileId) {
          userOldCVCount++;
          totalOldCVs++;
        }
      }

      if (userOldCVCount > 0) {
        usersWithOldCVs++;
        details.push({
          userId,
          email: (userData as any).profile?.email || "Unknown",
          oldCVCount: userOldCVCount,
        });
      }
    }

    return { totalOldCVs, usersWithOldCVs, details };
  }
}
