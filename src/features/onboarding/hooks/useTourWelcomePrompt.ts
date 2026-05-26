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
  /** Delay before showing the banner (ms) */
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
      if (sessionStorage.getItem(getPromptSkippedKey(pageId)) === "1") {
        return;
      }
    }

    const timer = setTimeout(() => {
      if (!isTourCompleted(pageId)) {
        setVisible(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [pageId, enabled, delay, isReady, isTourCompleted]);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(getPromptSkippedKey(pageId), "1");
    }
  }, [pageId]);

  const start = useCallback(() => {
    setVisible(false);
    startTour(pageId, stepsRef.current);
  }, [pageId, startTour]);

  return { visible, start, dismiss };
}
