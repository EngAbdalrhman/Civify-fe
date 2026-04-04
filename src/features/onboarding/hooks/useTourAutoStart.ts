import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!FLAGS.ENABLE_GUIDED_TOURS) return;
    if (!enabled) return;
    if (!isReady) return;
    if (hasTriggered) return;
    if (isTourCompleted(pageId)) return;

    const timer = setTimeout(() => {
      startTour(pageId, steps);
      setHasTriggered(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [pageId, steps, enabled, delay, startTour, isTourCompleted, hasTriggered, isReady]);
}
