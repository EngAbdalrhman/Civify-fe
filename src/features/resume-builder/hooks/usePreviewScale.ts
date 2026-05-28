"use client";

import { RefObject, useState, useEffect, useRef } from "react";

const RESUME_WIDTH = 794; // 210mm in pixels
const MIN_SCALE = 0.35;
const MAX_SCALE = 1;
const DEBOUNCE_MS = 120;

interface UsePreviewScaleOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  padding?: number;
  enabled?: boolean;
}

/**
 * Responsive scale for resume preview based on container width.
 * Debounced observers avoid layout thrash and iOS stack overflows from tight update loops.
 */
export function usePreviewScale({
  containerRef,
  padding = 32,
  enabled = true,
}: UsePreviewScaleOptions) {
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setScale(1);
      setScaledHeight(null);
      return;
    }

    const applyScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const availableWidth = containerWidth - padding;
      const newScale = Math.min(
        Math.max(availableWidth / RESUME_WIDTH, MIN_SCALE),
        MAX_SCALE,
      );

      const resumeElement = document.getElementById("resume-preview-content");
      const resumeHeight = resumeElement?.offsetHeight ?? 1123;
      const newScaledHeight = resumeHeight * newScale;

      setScale((prev) => (Math.abs(prev - newScale) < 0.001 ? prev : newScale));
      setScaledHeight((prev) =>
        prev !== null && Math.abs(prev - newScaledHeight) < 1 ? prev : newScaledHeight,
      );
    };

    const scheduleRecalculate = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          applyScale();
          rafRef.current = null;
        });
      }, DEBOUNCE_MS);
    };

    scheduleRecalculate();

    window.addEventListener("resize", scheduleRecalculate);

    const resizeObserver = new ResizeObserver(scheduleRecalculate);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const resumeEl = document.getElementById("resume-preview-content");
    let mutationObserver: MutationObserver | null = null;
    if (resumeEl) {
      mutationObserver = new MutationObserver(scheduleRecalculate);
      mutationObserver.observe(resumeEl, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      resizeObserver.observe(resumeEl);
    }

    return () => {
      window.removeEventListener("resize", scheduleRecalculate);
      resizeObserver.disconnect();
      mutationObserver?.disconnect();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, padding, enabled]);

  return { scale, scaledHeight };
}
