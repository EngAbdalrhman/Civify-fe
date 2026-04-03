"use client";

import { Link } from "@/i18n/routing";
import { useMyActiveSubscription } from "@/features/plans/hooks/useSubscription";

export function AdBanner() {
  const { data: subscription, isLoading } = useMyActiveSubscription();

  // If loading, don't show anything yet
  if (isLoading) return null;

  // Check if user is on a paid plan
  const isPaidPlan =
    subscription?.status === "ACTIVE" &&
    subscription?.planName?.toLowerCase() !== "free";

  if (isPaidPlan) return null;

  return (
    <div className="my-4 p-4 border border-dashed border-border rounded-lg flex flex-col items-center justify-center relative bg-muted/30">
      <span className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wider">
        Advertisement
      </span>
      
      {/* Monetag banner placeholder */}
      <div id="monetag-banner-placeholder" className="w-full min-h-[90px] flex items-center justify-center bg-background rounded border border-border/50">
        <span className="text-muted-foreground text-sm">Ad Banner Space</span>
      </div>
      
      <Link 
        href="/plans" 
        className="absolute top-0 right-0 -mt-3 -mr-2 text-[10px] bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-sm hover:opacity-90 transition-opacity font-medium z-10"
      >
        Remove Ads
      </Link>
    </div>
  );
}
