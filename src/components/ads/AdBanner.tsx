"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useMyActiveSubscription } from "@/features/plans/hooks/useSubscription";

const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED !== "false";

export function AdBanner() {
    const {
        data: subscription,
        isLoading,
        isError: isSubscriptionError,
    } = useMyActiveSubscription();
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
        <div className="my-3 sm:my-4 p-3 sm:p-4 border border-dashed border-border rounded-lg flex flex-col items-center justify-center relative overflow-visible bg-muted/30">
            <a
                href="mailto:ceo@civify.cv"
                className="z-[99998] mx-auto block overflow-hidden"
                style={{ width: `${AD_WIDTH}px`, height: "auto" }}
                aria-label="Contact Civify for ad space"
            >
                <Image
                    src="/ad%20with%20us.png"
                    alt="Advertise with Civify"
                    width={AD_WIDTH}
                    height={AD_HEIGHT}
                    loading="lazy"
                    style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                    }}
                />
            </a>

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