"use client";

import Script from "next/script";

/**
 * AnalyticsProvider component that loads Microsoft Clarity and Google Analytics
 * tracking scripts. Only loads when environment variables are configured.
 */
export function AnalyticsProvider() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const isProduction = process.env.NODE_ENV === "production";

  // Only load analytics in production
  if (!isProduction) {
    return null;
  }

  return (
    <>
      {/* Microsoft Clarity */}
      {clarityId && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
        </Script>
      )}

      {/* Google Analytics 4 */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                'referral_exclusion_domains': ['accounts.google.com']
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}
