"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useMyActiveSubscription } from "@/features/plans/hooks/useSubscription";

export function AdBanner() {
  const { data: subscription, isLoading } = useMyActiveSubscription();
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect PWA standalone mode — hide ads in installed app context
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsPwa(isStandalone);

    // Wait until subscription is loaded before making ad decisions
    if (isLoading) return;

    // Check if user is on a paid plan
    const isPaid =
      subscription?.status === "ACTIVE" &&
      subscription?.planName?.toLowerCase() !== "free";

    if (isStandalone || isPaid) return;

    // Inject Monetag script (vignette format as provided by user)
    // using the exact provided snippet logic if it doesn't already exist.
    if (!document.querySelector('script[data-zone="10826560"]')) {
      const s = document.createElement("script");
      s.dataset.zone = "10826560";
      s.src = "https://n6wxm.com/vignette.min.js";
      
      const target = [document.documentElement, document.body].filter(Boolean).pop();
      if (target) {
        target.appendChild(s);
      }
    }
  }, [isLoading, subscription]);

  // Don't show while loading
  if (isLoading) return null;

  // Hide in PWA standalone mode
  if (isPwa) return null;

  // Check if user is on a paid plan
  const isPaidPlan =
    subscription?.status === "ACTIVE" &&
    subscription?.planName?.toLowerCase() !== "free";

  if (isPaidPlan) return null;

  return (
    <div className="my-3 sm:my-4 p-3 sm:p-4 border border-dashed border-border rounded-lg flex flex-col items-center justify-center relative overflow-visible bg-muted/30">
      <span className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wider">
        Advertisement
      </span>

      {/* Monetag banner placeholder — responsive height */}
      <div
        id="monetag-banner-placeholder"
        className="w-full min-h-[60px] sm:min-h-[90px] flex items-center justify-center bg-background rounded border border-border/50"
      >
        <span className="text-muted-foreground text-xs sm:text-sm">
          Ad Banner Space
        </span>
      </div>

      {/* Remove Ads badge — 44px minimum touch target for mobile */}
      <Link
        href="/plans"
        className="absolute top-0 right-0 -mt-2 -mr-1 sm:-mt-3 sm:-mr-2 text-[10px] sm:text-[11px] bg-primary text-primary-foreground px-3 py-1.5 sm:py-1 min-h-[44px] sm:min-h-0 min-w-[44px] sm:min-w-0 flex items-center justify-center rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all font-medium z-10"
      >
        Remove Ads
      </Link>
    </div>
  );
}
