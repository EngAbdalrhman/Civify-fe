"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useDatabase } from "@/hooks/use-database";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Loader } from "@/components/app/Loader";
import { UserProfile } from "@/lib/types";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isHydrated } = useAuth();
  const database = useDatabase();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (database && user) {
      loadUserProfile();
    }
  }, [database, user]);

  const loadUserProfile = async () => {
    if (!database) return;

    try {
      const profile = await database.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userProfile={userProfile} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

