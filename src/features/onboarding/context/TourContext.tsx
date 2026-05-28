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

function cleanupTourDomArtifacts() {
  if (typeof document === "undefined") return;

  document.querySelectorAll("[data-tour]").forEach((el) => {
    const node = el as HTMLElement;
    node.style.removeProperty("position");
    node.style.removeProperty("z-index");
    node.classList.remove("driver-active-element");
  });

  document.querySelectorAll(".overflow-hidden").forEach((el) => {
    el.scrollTop = 0;
  });
}

interface TourContextValue {
  completedTours: Record<string, boolean>;
  startTour: (pageId: string, steps: DriveStep[]) => void;
  completeTour: (pageId: string) => void;
  resetTour: (pageId: string) => void;
  resetAllTours: () => void;
  isTourCompleted: (pageId: string) => boolean;
  isReady: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [completedTours, setCompletedTours] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

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

  useEffect(() => {
    if (!userProfile) {
      if (typeof window !== "undefined" && !getAccessToken()) {
        setIsReady(true);
      }
      return;
    }
    try {
      if (userProfile.completedTours) {
        setCompletedTours(JSON.parse(userProfile.completedTours));
        localStorage.removeItem(TOUR_COMPLETED_KEY);
      } else {
        const stored = localStorage.getItem(TOUR_COMPLETED_KEY);
        if (stored) {
          setCompletedTours(JSON.parse(stored));
          apiClient
            .put("/v1/users/me/onboarding-status", { completedTours: stored })
            .then(() => localStorage.removeItem(TOUR_COMPLETED_KEY))
            .catch(() => null);
        }
      }
    } catch (e) {
      console.error("Failed to parse tour storage:", e);
    }
    setIsReady(true);
  }, [userProfile]);

  const saveTours = useCallback(async (newTours: Record<string, boolean>) => {
    setCompletedTours(newTours);
    if (getAccessToken()) {
      try {
        await apiClient.put("/v1/users/me/onboarding-status", {
          completedTours: JSON.stringify(newTours),
        });
      } catch (e) {
        console.error("Failed to sync tour status to backend", e);
      }
    } else if (typeof window !== "undefined") {
      localStorage.setItem(TOUR_COMPLETED_KEY, JSON.stringify(newTours));
    }
  }, []);

  const completeTour = useCallback(
    (pageId: string) => {
      setCompletedTours((prev) => {
        const updated = { ...prev, [pageId]: true };
        saveTours(updated);
        return updated;
      });
    },
    [saveTours],
  );

  const startTour = useCallback(
    (pageId: string, steps: DriveStep[]) => {
      if (!isClient) return;

      const nextText = t("nextStep") || "Next";
      const prevText = t("prevStep") || "Back";
      const doneText = t("doneButton") || "Done";

      let didFinish = false;
      const finishOnce = () => {
        if (didFinish) return;
        didFinish = true;
        cleanupTourDomArtifacts();
        if (typeof window !== "undefined") {
          window.scrollTo(0, 0);
        }
        completeTour(pageId);
      };

      const tourDriver = driver({
        showProgress: true,
        allowClose: true,
        smoothScroll: false,
        popoverClass: "civify-tour",
        steps: steps.map((step) => ({
          ...step,
          popover: {
            ...step.popover,
            showButtons: ["next", "previous", "close"],
          },
        })),
        nextBtnText: nextText,
        prevBtnText: prevText,
        doneBtnText: doneText,
        progressText: "{{current}} / {{total}}",
        onHighlighted: (element?: Element) => {
          if (element) {
            (element as HTMLElement).style.removeProperty("position");
            (element as HTMLElement).style.removeProperty("z-index");
          }
        },
        onDeselected: (element?: Element) => {
          if (element) {
            (element as HTMLElement).style.removeProperty("position");
            (element as HTMLElement).style.removeProperty("z-index");
          }
        },
        onDestroyed: finishOnce,
      });

      try {
        tourDriver.drive();
      } catch (e) {
        console.warn("Could not start driver.js tour (element not found?):", e);
        try {
          tourDriver.destroy();
        } catch {
          /* already torn down */
        }
        finishOnce();
      }
    },
    [isClient, completeTour, t],
  );

  const resetTour = useCallback(
    (pageId: string) => {
      setCompletedTours((prev) => {
        const updated = { ...prev };
        delete updated[pageId];
        saveTours(updated);
        return updated;
      });
    },
    [saveTours],
  );

  const resetAllTours = useCallback(() => {
    saveTours({});
  }, [saveTours]);

  const isTourCompleted = useCallback(
    (pageId: string) => {
      return !!completedTours[pageId];
    },
    [completedTours],
  );

  return (
    <TourContext.Provider
      value={{
        completedTours,
        startTour,
        completeTour,
        resetTour,
        resetAllTours,
        isTourCompleted,
        isReady,
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
