"use client";

import { useCallback, useRef } from "react";
import { ResumeData } from "@/features/upload-cv/types";

const GUEST_RESUME_KEY = "civify_guest_resume";
const GUEST_RESUME_TITLE_KEY = "civify_guest_resume_title";
const DEBOUNCE_MS = 500;

export function useGuestResumeStorage() {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveGuestResume = useCallback((data: ResumeData, title?: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(GUEST_RESUME_KEY, JSON.stringify(data));
        if (title) {
          localStorage.setItem(GUEST_RESUME_TITLE_KEY, title);
        }
      } catch (error) {
        console.error("[GuestStorage] Failed to save to localStorage:", error);
      }
    }, DEBOUNCE_MS);
  }, []);

  const saveGuestResumeImmediate = useCallback(
    (data: ResumeData, title?: string) => {
      try {
        localStorage.setItem(GUEST_RESUME_KEY, JSON.stringify(data));
        if (title) {
          localStorage.setItem(GUEST_RESUME_TITLE_KEY, title);
        }
      } catch (error) {
        console.error("[GuestStorage] Failed to save to localStorage:", error);
      }
    },
    [],
  );

  const loadGuestResume = useCallback((): ResumeData | null => {
    try {
      const stored = localStorage.getItem(GUEST_RESUME_KEY);
      if (stored) {
        return JSON.parse(stored) as ResumeData;
      }
    } catch (error) {
      console.error("[GuestStorage] Failed to load from localStorage:", error);
    }
    return null;
  }, []);

  const hasGuestResume = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(GUEST_RESUME_KEY);
      if (!stored) return false;
      const data = JSON.parse(stored) as ResumeData;
      // Check if there's any meaningful data (not just the empty template)
      return !!(
        data.personalInfo?.fullName ||
        data.personalInfo?.email ||
        data.sections?.some((s) => s.items?.length > 0)
      );
    } catch {
      return false;
    }
  }, []);

  const getGuestResumeTitle = useCallback((): string => {
    try {
      return localStorage.getItem(GUEST_RESUME_TITLE_KEY) || "Untitled Resume";
    } catch {
      return "Untitled Resume";
    }
  }, []);

  const clearGuestResume = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_RESUME_KEY);
      localStorage.removeItem(GUEST_RESUME_TITLE_KEY);
    } catch (error) {
      console.error("[GuestStorage] Failed to clear localStorage:", error);
    }
  }, []);

  return {
    saveGuestResume,
    saveGuestResumeImmediate,
    loadGuestResume,
    hasGuestResume,
    getGuestResumeTitle,
    clearGuestResume,
  };
}
