"use client";

import { RefObject, useState, useEffect } from "react";

const RESUME_WIDTH = 794; // 210mm in pixels
const MIN_SCALE = 0.35;
const MAX_SCALE = 1;

interface UsePreviewScaleOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  padding?: number;
  enabled?: boolean;
}

/**
 * Custom hook to calculate the responsive scale for the resume preview
 * based on the container width.
 */
export function usePreviewScale({
  containerRef,
  padding = 32,
  enabled = true,
}: UsePreviewScaleOptions) {
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setScale(1);
      setScaledHeight(null);
      return;
    }

    const calculateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const availableWidth = containerWidth - padding;
        const newScale = Math.min(
          Math.max(availableWidth / RESUME_WIDTH, MIN_SCALE),
          MAX_SCALE,
        );
        setScale(newScale);

        // Calculate the scaled height for the container (A4 aspect ratio: 210mm x 297mm)
        const resumeHeight = 1123; // 297mm in pixels
        setScaledHeight(resumeHeight * newScale);
      }
    };

    calculateScale();

    // Recalculate on window resize
    window.addEventListener("resize", calculateScale);

    // Observe container size changes for dynamic layouts
    const resizeObserver = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", calculateScale);
      resizeObserver.disconnect();
    };
  }, [containerRef, padding, enabled]);

  return { scale, scaledHeight };
}
