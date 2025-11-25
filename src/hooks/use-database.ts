"use client";

import { useMemo } from "react";
import { userService } from "@/lib/api/services/user.service";
import { cvService } from "@/lib/api/services/cv.service";
import { jobApplicationService } from "@/lib/api/services/job-application.service";

export const useDatabase = () => {
  const services = useMemo(() => {
    return {
      // User Profile
      getUserProfile: () => userService.getProfile(),
      updateUserProfile: (data: any) => userService.updateProfile(data),
      
      // CVs
      getAllCVs: () => cvService.getAllCVs(),
      getCVById: (id: string) => cvService.getCV(id),
      saveCVData: (data: any) => cvService.createCV(data),
      deleteCVData: (id: string) => cvService.deleteCV(id),
      updateCV: (id: string, data: any) => cvService.updateCV(id, data),

      // Job Applications
      getAllJobApplications: () => jobApplicationService.getAllApplications(),
      getJobApplicationById: (id: string) => jobApplicationService.getApplication(id),
      saveJobApplication: (data: any) => jobApplicationService.createApplication(data),
      updateJobApplication: (id: string, data: any) => jobApplicationService.updateApplication(id, data),
      deleteJobApplication: (id: string) => jobApplicationService.deleteApplication(id),

      // API Keys (if needed here, or use userService directly)
      getApiKeys: () => userService.getApiKeys(),
      saveApiKey: (name: string) => userService.createApiKey(name),
      deactivateApiKey: (id: string) => userService.revokeApiKey(id),
      
      // API Usage
      getApiUsageLogs: () => userService.getApiUsage(),
    };
  }, []);

  return services;
};
