"use client";

import { useEffect, useRef, useState } from "react";

/** Mount expensive decoration once it approaches the viewport. */
export function useNearViewport<T extends Element>(rootMargin = "200px") {
  const ref = useRef<T>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setIsNear(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsNear(true);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, isNear };
}
