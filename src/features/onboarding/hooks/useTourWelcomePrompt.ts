"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DriveStep } from "driver.js";
import { FLAGS } from "@/config/flags";
import { useTour } from "../context/TourContext";

const PROMPT_SKIPPED_PREFIX = "civify_tour_prompt_skipped_";
const DEFAULT_DELAY_MS = 2000;

function getPromptSkippedKey(pageId: string) {
  return `${PROMPT_SKIPPED_PREFIX}${pageId}`;
}

interface UseTourWelcomePromptOptions {
  pageId: string;
  steps: DriveStep[];
  enabled?: boolean;
  /** Delay before showing the modal (ms) */
  delay?: number;
}

export function useTourWelcomePrompt({
  pageId,
  steps,
  enabled = true,
  delay = DEFAULT_DELAY_MS,
}: UseTourWelcomePromptOptions) {
  const { startTour, isTourCompleted, isReady } = useTour();
  const [visible, setVisible] = useState(false);
  const stepsRef = useRef(steps);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  stepsRef.current = steps;

  useEffect(() => {
    setVisible(false);
  }, [pageId, enabled]);

  useEffect(() => {
    if (!FLAGS.ENABLE_GUIDED_TOURS) return;
    if (FLAGS.TOUR_PROMPT_BEFORE_START === false) return;
    if (!enabled) return;
    if (!isReady) return;
    if (isTourCompleted(pageId)) return;

    if (typeof window !== "undefined") {
      if (localStorage.getItem(getPromptSkippedKey(pageId)) === "1") {
        return;
      }
    }

    timerRef.current = setTimeout(() => {
      if (typeof window !== "undefined") {
        if (localStorage.getItem(getPromptSkippedKey(pageId)) === "1") {
          return;
        }
      }
      if (!isTourCompleted(pageId)) {
        setVisible(true);
      }
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pageId, enabled, delay, isReady, isTourCompleted]);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(getPromptSkippedKey(pageId), "1");
    }
  }, [pageId]);

  const start = useCallback(() => {
    setVisible(false);
    startTour(pageId, stepsRef.current);
  }, [pageId, startTour]);

  return { visible, start, dismiss };
}
