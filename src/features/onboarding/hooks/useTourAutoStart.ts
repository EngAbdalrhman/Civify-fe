import { useEffect, useRef, useState } from "react";
import { useTour } from "../context/TourContext";
import type { DriveStep } from "driver.js";
import { FLAGS } from "@/config/flags";

interface TourAutoStartOptions {
  enabled?: boolean;
  delay?: number;
}

export function useTourAutoStart(
  pageId: string, 
  steps: DriveStep[], 
  options: TourAutoStartOptions = {}
) {
  const { enabled = true, delay = 500 } = options;
  const { startTour, isTourCompleted, isReady } = useTour();
  const [hasTriggered, setHasTriggered] = useState(false);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  useEffect(() => {
    if (!FLAGS.ENABLE_GUIDED_TOURS) return;
    /** Banner prompt handles first-time onboarding; avoid auto overlay */
    if (FLAGS.TOUR_PROMPT_BEFORE_START) return;
    if (!enabled) return;
    if (!isReady) return;
    if (hasTriggered) return;
    if (isTourCompleted(pageId)) return;

    const timer = setTimeout(() => {
      startTour(pageId, stepsRef.current);
      setHasTriggered(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [pageId, enabled, delay, startTour, isTourCompleted, hasTriggered, isReady]);
}
