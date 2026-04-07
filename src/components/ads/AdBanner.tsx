"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useMyActiveSubscription } from "@/features/plans/hooks/useSubscription";

const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED !== "false";

export function AdBanner() {
    const { data: subscription, isLoading } = useMyActiveSubscription();
    const [isPwa, setIsPwa] = useState(false);

    const AD_WIDTH = 970;
    const AD_HEIGHT = 250;

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

    // 3. PWA check
    if (isPwa) return null;

    // 4. Subscription check
    const isPaidPlan =
        subscription?.status === "ACTIVE" &&
        subscription?.planName?.toLowerCase() !== "free";

    if (isPaidPlan) return null;

    return (
        <div className="my-3 sm:my-4 p-3 sm:p-4 border border-dashed border-border rounded-lg flex flex-col items-center justify-center relative overflow-visible bg-muted/30">
            {/* A-ADS banner unit 2433336 (300x250) */}
            <div
                id="frame"
                className="z-[99998] mx-auto overflow-hidden"
                style={{ width: `${AD_WIDTH}px`, height: "auto" }}
            >
                <iframe
                    data-aa="2433336"
                    src="//ad.a-ads.com/2433336/?size=970x250"
                    title="Advertisement"
                    loading="lazy"
                    sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={{
                        border: 0,
                        padding: 0,
                        width: `${AD_WIDTH}px`,
                        height: `${AD_HEIGHT}px`,
                        overflow: "hidden",
                        display: "block",
                        margin: "auto",
                    }}
                />
            </div>

            {/* Remove Ads badge */}
            <Link
                href="/plans"
                className="absolute top-0 right-0 -mt-2 -mr-1 sm:-mt-3 sm:-mr-2 text-[10px] sm:text-[11px] bg-primary text-primary-foreground px-3 py-1.5 sm:py-1 min-h-[44px] sm:min-h-0 min-w-[44px] sm:min-w-0 flex items-center justify-center rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all font-medium z-10"
            >
                Remove Ads
            </Link>
        </div>
    );
}