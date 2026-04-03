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

        // Calculate the scaled height dynamically to support content exceeding standard A4
        const resumeElement = document.getElementById("resume-preview-content");
        const resumeHeight = resumeElement ? resumeElement.offsetHeight : 1123; // 297mm base
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

    // Observe content mutations (section toggles, data changes) to recalculate height
    const resumeEl = document.getElementById("resume-preview-content");
    let mutationObserver: MutationObserver | null = null;
    if (resumeEl) {
      mutationObserver = new MutationObserver(calculateScale);
      mutationObserver.observe(resumeEl, { childList: true, subtree: true, attributes: true });
      resizeObserver.observe(resumeEl);
    }

    // Fallback: periodically recalculate to catch any missed changes
    const interval = setInterval(calculateScale, 500);

    return () => {
      window.removeEventListener("resize", calculateScale);
      resizeObserver.disconnect();
      mutationObserver?.disconnect();
      clearInterval(interval);
    };
  }, [containerRef, padding, enabled]);

  return { scale, scaledHeight };
}
