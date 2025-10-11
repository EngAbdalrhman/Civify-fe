"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { AppwriteDatabaseService } from "@/lib/services/appwrite-database";

export const useDatabase = () => {
  const { user } = useAuth();

  const databaseService = useMemo(() => {
    if (!user) return null;
    return new AppwriteDatabaseService(user.uid);
  }, [user]);

  useEffect(() => {
    if (databaseService && user) {
      // Initialize user profile when database service is created
      // Pass Firebase user object to get email and displayName
      databaseService.getUserProfile(user).catch(console.error);
    }
  }, [databaseService, user]);

  return databaseService;
};
