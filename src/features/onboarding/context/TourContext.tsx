"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { driver } from "driver.js";
import type { DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import "../styles/tour-theme.css";
import { useTranslations } from "next-intl";
import { useUserProfile } from "@/hooks/useUserProfile";
import apiClient from "@/api/client";
import { getAccessToken } from "@/utils/cookies";

const TOUR_COMPLETED_KEY = "civify_tour_completed";

interface TourContextValue {
  completedTours: Record<string, boolean>;
  startTour: (pageId: string, steps: DriveStep[]) => void;
  completeTour: (pageId: string) => void;
  resetTour: (pageId: string) => void;
  resetAllTours: () => void;
  isTourCompleted: (pageId: string) => boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [completedTours, setCompletedTours] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);
  
  // We can use the common translations for next/prev/done buttons
  const t = useTranslations("tour.common");

  const { data: userProfile } = useUserProfile();

  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem(TOUR_COMPLETED_KEY);
      if (stored) {
        setCompletedTours(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse local tour storage:", e);
    }
  }, []);

  // Sync with backend / local storage
  useEffect(() => {
    if (!userProfile) return;
    try {
      if (userProfile.completedTours) {
        setCompletedTours(JSON.parse(userProfile.completedTours));
      } else {
        const stored = localStorage.getItem(TOUR_COMPLETED_KEY);
        if (stored) {
          setCompletedTours(JSON.parse(stored));
          // Migrate to backend
          apiClient.put("/v1/users/me/onboarding-status", { completedTours: stored }).catch(() => null);
        }
      }
    } catch (e) {
      console.error("Failed to parse tour storage:", e);
    }
  }, [userProfile]);

  const saveTours = useCallback(async (newTours: Record<string, boolean>) => {
    setCompletedTours(newTours);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOUR_COMPLETED_KEY, JSON.stringify(newTours));
    }
    if (getAccessToken()) {
      try {
        await apiClient.put("/v1/users/me/onboarding-status", {
          completedTours: JSON.stringify(newTours),
        });
      } catch (e) {
        console.error("Failed to sync tour status to backend", e);
      }
    }
  }, []);

  const completeTour = useCallback((pageId: string) => {
    setCompletedTours(prev => {
      const updated = { ...prev, [pageId]: true };
      saveTours(updated);
      return updated;
    });
  }, [saveTours]);

  const startTour = useCallback((pageId: string, steps: DriveStep[]) => {
    if (!isClient) return;

    // Use translation keys with fallback
    const nextText = t("nextStep") || "Next";
    const prevText = t("prevStep") || "Back";
    const doneText = t("doneButton") || "Done";

    const tourDriver = driver({
      showProgress: true,
      allowClose: true,
      popoverClass: "civify-tour",
      steps: steps.map(step => ({
          ...step,
          popover: {
              ...step.popover,
              showButtons: ['next', 'previous', 'close'],
          }
      })),
      nextBtnText: nextText,
      prevBtnText: prevText,
      doneBtnText: doneText,
      progressText: '{{current}} / {{total}}',
      onDestroyed: () => {
        completeTour(pageId);
      },
    });

    // Wrapped in try catch to handle cases where elements might not be available
    try {
        tourDriver.drive();
    } catch (e) {
        console.warn("Could not start driver.js tour (element not found?):", e);
    }
  }, [isClient, completeTour, t]);

  const resetTour = useCallback((pageId: string) => {
    setCompletedTours(prev => {
      const updated = { ...prev };
      delete updated[pageId];
      saveTours(updated);
      return updated;
    });
  }, [saveTours]);

  const resetAllTours = useCallback(() => {
    saveTours({});
  }, [saveTours]);

  const isTourCompleted = useCallback((pageId: string) => {
    return !!completedTours[pageId];
  }, [completedTours]);

  return (
    <TourContext.Provider
      value={{
        completedTours,
        startTour,
        completeTour,
        resetTour,
        resetAllTours,
        isTourCompleted,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
