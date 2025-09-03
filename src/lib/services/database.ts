"use client";

import { db } from "@/lib/firebase";
import { 
  ref, 
  set, 
  get, 
  push, 
  update, 
  remove, 
  onValue, 
  off,
  serverTimestamp 
} from "firebase/database";
import { 
  CVData, 
  UserProfile, 
  JobApplication, 
  GeneratedContent, 
  UserSettings,
  UserData,
  StructuredCVData 
} from "@/lib/types";

export class DatabaseService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // User Profile Methods
  async saveUserProfile(profile: UserProfile): Promise<void> {
    const userProfileRef = ref(db, `users/${this.userId}/profile`);
    await set(userProfileRef, {
      ...profile,
      updatedAt: serverTimestamp(),
    });
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const userProfileRef = ref(db, `users/${this.userId}/profile`);
    const snapshot = await get(userProfileRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  // CV Data Methods
  async saveCVData(cvData: Omit<CVData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const cvsRef = ref(db, `users/${this.userId}/cvs`);
    const newCVRef = push(cvsRef);
    const cvId = newCVRef.key!;

    const cvDataWithMetadata: CVData = {
      ...cvData,
      id: cvId,
      userId: this.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await set(newCVRef, cvDataWithMetadata);
    return cvId;
  }

  async updateCVData(cvId: string, updates: Partial<CVData>): Promise<void> {
    const cvRef = ref(db, `users/${this.userId}/cvs/${cvId}`);
    await update(cvRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async getCVData(cvId: string): Promise<CVData | null> {
    const cvRef = ref(db, `users/${this.userId}/cvs/${cvId}`);
    const snapshot = await get(cvRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  async getAllCVs(): Promise<CVData[]> {
    const cvsRef = ref(db, `users/${this.userId}/cvs`);
    const snapshot = await get(cvsRef);
    if (!snapshot.exists()) return [];
    
    const cvsData = snapshot.val();
    return Object.values(cvsData) as CVData[];
  }

  async deleteCVData(cvId: string): Promise<void> {
    const cvRef = ref(db, `users/${this.userId}/cvs/${cvId}`);
    await remove(cvRef);
  }

  // Job Application Methods
  async saveJobApplication(jobApp: Omit<JobApplication, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const jobAppsRef = ref(db, `users/${this.userId}/jobApplications`);
    const newJobAppRef = push(jobAppsRef);
    const jobAppId = newJobAppRef.key!;

    const jobAppWithMetadata: JobApplication = {
      ...jobApp,
      id: jobAppId,
      userId: this.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await set(newJobAppRef, jobAppWithMetadata);
    return jobAppId;
  }

  async updateJobApplication(jobAppId: string, updates: Partial<JobApplication>): Promise<void> {
    const jobAppRef = ref(db, `users/${this.userId}/jobApplications/${jobAppId}`);
    await update(jobAppRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async getJobApplication(jobAppId: string): Promise<JobApplication | null> {
    const jobAppRef = ref(db, `users/${this.userId}/jobApplications/${jobAppId}`);
    const snapshot = await get(jobAppRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  async getAllJobApplications(): Promise<JobApplication[]> {
    const jobAppsRef = ref(db, `users/${this.userId}/jobApplications`);
    const snapshot = await get(jobAppsRef);
    if (!snapshot.exists()) return [];
    
    const jobAppsData = snapshot.val();
    return Object.values(jobAppsData) as JobApplication[];
  }

  async deleteJobApplication(jobAppId: string): Promise<void> {
    const jobAppRef = ref(db, `users/${this.userId}/jobApplications/${jobAppId}`);
    await remove(jobAppRef);
  }

  // Generated Content Methods
  async saveGeneratedContent(content: Omit<GeneratedContent, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    const contentRef = ref(db, `users/${this.userId}/generatedContent`);
    const newContentRef = push(contentRef);
    const contentId = newContentRef.key!;

    const contentWithMetadata: GeneratedContent = {
      ...content,
      id: contentId,
      userId: this.userId,
      createdAt: new Date().toISOString(),
    };

    await set(newContentRef, contentWithMetadata);
    return contentId;
  }

  async getGeneratedContent(contentId: string): Promise<GeneratedContent | null> {
    const contentRef = ref(db, `users/${this.userId}/generatedContent/${contentId}`);
    const snapshot = await get(contentRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  async getAllGeneratedContent(): Promise<GeneratedContent[]> {
    const contentRef = ref(db, `users/${this.userId}/generatedContent`);
    const snapshot = await get(contentRef);
    if (!snapshot.exists()) return [];
    
    const contentData = snapshot.val();
    return Object.values(contentData) as GeneratedContent[];
  }

  // User Settings Methods
  async saveUserSettings(settings: UserSettings): Promise<void> {
    const settingsRef = ref(db, `users/${this.userId}/settings`);
    await set(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    });
  }

  async getUserSettings(): Promise<UserSettings | null> {
    const settingsRef = ref(db, `users/${this.userId}/settings`);
    const snapshot = await get(settingsRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  // Real-time listeners
  onCVsChange(callback: (cvs: CVData[]) => void): () => void {
    const cvsRef = ref(db, `users/${this.userId}/cvs`);
    
    const listener = onValue(cvsRef, (snapshot) => {
      if (snapshot.exists()) {
        const cvsData = snapshot.val();
        const cvsArray = Object.values(cvsData) as CVData[];
        callback(cvsArray);
      } else {
        callback([]);
      }
    });

    return () => off(cvsRef, "value", listener);
  }

  onJobApplicationsChange(callback: (jobApps: JobApplication[]) => void): () => void {
    const jobAppsRef = ref(db, `users/${this.userId}/jobApplications`);
    
    const listener = onValue(jobAppsRef, (snapshot) => {
      if (snapshot.exists()) {
        const jobAppsData = snapshot.val();
        const jobAppsArray = Object.values(jobAppsData) as JobApplication[];
        callback(jobAppsArray);
      } else {
        callback([]);
      }
    });

    return () => off(jobAppsRef, "value", listener);
  }

  // Utility Methods
  async initializeUserData(): Promise<void> {
    const userRef = ref(db, `users/${this.userId}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      const initialUserData: Partial<UserData> = {
        profile: {
          name: "",
          email: "",
          phone: "",
          summary: "",
          experience: "",
          education: "",
          skills: "",
        },
        settings: {
          theme: 'system',
          notifications: {
            email: true,
            browser: true,
          },
          privacy: {
            shareAnalytics: false,
            saveHistory: true,
          },
          preferences: {
            defaultCVFormat: 'modern',
            autoSave: true,
            saveToCloud: true,
          },
        },
      };

      await set(userRef, {
        ...initialUserData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }
}
