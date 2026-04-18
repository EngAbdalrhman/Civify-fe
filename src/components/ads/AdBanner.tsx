"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useMyActiveSubscription } from "@/features/plans/hooks/useSubscription";
import { cn } from "@/lib/utils";

const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED !== "false";

interface AdBannerProps {
    orientation?: "horizontal" | "vertical";
    className?: string;
}

export function AdBanner({ orientation = "horizontal", className }: AdBannerProps = {}) {
    const {
        data: subscription,
        isLoading,
        isError: isSubscriptionError,
    } = useMyActiveSubscription();
    const [isPwa, setIsPwa] = useState(false);

    useEffect(() => {
        // useEffect only runs on the client, so no 'typeof window' check is needed.
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;
        setIsPwa(isStandalone);
    }, []);

    // 1. Feature flag check
    if (!ADS_ENABLED) return null;

    // 2. Loading state
    if (isLoading) return null;

    // Fail-safe: do not show ads when subscription lookup fails
    if (isSubscriptionError) return null;

    // 3. PWA check
    if (isPwa) return null;

    // 4. Subscription check
    const subscriptionStatus = subscription?.status?.toString().toUpperCase();
    const planName = subscription?.planName?.toString().trim().toLowerCase();
    const isPaidPlan =
        subscriptionStatus === "ACTIVE" &&
        !!planName &&
        planName !== "free";

    if (isPaidPlan) return null;

    return (
        <div 
            className={cn(
                "relative flex items-center justify-center overflow-visible border border-dashed border-border rounded-lg bg-muted/30 transition-all",
                orientation === "horizontal" 
                    ? "w-full my-3 sm:my-4 p-2 sm:p-4" 
                    : "w-full max-w-[320px] mx-auto my-3 sm:my-4 p-2 sm:p-4",
                className
            )}
        >
            <a
                href="mailto:ceo@civify.cv"
                className="relative z-0 block w-full h-full overflow-hidden rounded group"
                aria-label="Contact Civify for ad space"
            >
                <div className={cn(
                    "relative w-full overflow-hidden flex items-center justify-center transition-transform group-hover:scale-[1.01]",
                    orientation === "vertical" 
                        ? "aspect-[300/250] sm:aspect-[300/600]" // Medium Rectangle on mobile, Half Page on desktop
                        : "aspect-[320/100] sm:aspect-[970/250]" // Mobile Banner on mobile, Billboard on desktop
                )}>
                    <Image
                        src="/ad%20with%20us.png"
                        alt="Advertise with Civify"
                        fill
                        className="object-contain"
                        sizes={
                            orientation === "vertical" 
                                ? "(max-width: 640px) 300px, 300px" 
                                : "(max-width: 640px) 100vw, 970px"
                        }
                        loading="lazy"
                    />
                </div>
            </a>

            {/* Remove Ads badge */}
            <Link
                href="/plans"
                className={cn(
                    "absolute flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium shadow-sm transition-all hover:opacity-90 active:scale-95 z-10",
                    "text-[10px] sm:text-[11px] px-3 py-1 sm:py-1",
                    "min-h-[44px] sm:min-h-0 min-w-[44px] sm:min-w-0", // Larger touch target for mobile
                    orientation === "horizontal"
                        ? "-top-3 -right-2 sm:-top-3 sm:-right-3"
                        : "-top-3 -right-2 sm:-top-3 sm:-right-3"
                )}
            >
                Remove Ads
            </Link>
        </div>
    );
}