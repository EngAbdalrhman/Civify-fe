/**
 * Utility for tracking onboarding analytics events via Google Analytics (gtag).
 *
 * Supported events:
 * - onboarding_started
 * - primary_intent_selected
 * - builder_started / builder_persona_completed
 * - tailor_started / cv_uploaded / job_description_added / tailor_generated
 * - api_key_created
 * - first_cv_created
 * - onboarding_completed
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackOnboardingEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  try {
    const baseParams = {
      timestamp: new Date().toISOString(),
      ...params,
    };

    // Fire GA4 custom event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, baseParams);
    }

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Onboarding Event] ${eventName}`, baseParams);
    }
  } catch {
    // Silently fail — analytics should never break the app
  }
}
