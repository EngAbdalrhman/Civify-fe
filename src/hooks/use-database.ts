"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { DatabaseService } from "@/lib/services/database";

export const useDatabase = () => {
  const { user } = useAuth();

  const databaseService = useMemo(() => {
    if (!user) return null;
    return new DatabaseService(user.uid);
  }, [user]);

  useEffect(() => {
    if (databaseService) {
      // Initialize user data when database service is created
      databaseService.initializeUserData().catch(console.error);
    }
  }, [databaseService]);

  return databaseService;
};
