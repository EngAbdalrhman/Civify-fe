"use client";

import { useState, useEffect, RefObject } from "react";

interface UseFullscreenReturn {
  isFullScreen: boolean;
  toggleFullscreen: (
    elementRef: RefObject<HTMLElement | null>,
  ) => Promise<void>;
}

export function useFullscreen(): UseFullscreenReturn {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async (
    elementRef: RefObject<HTMLElement | null>,
  ): Promise<void> => {
    if (!document.fullscreenElement) {
      await elementRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return { isFullScreen, toggleFullscreen };
}
