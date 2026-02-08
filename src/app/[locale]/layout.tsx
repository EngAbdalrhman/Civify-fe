import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { PermissionProvider } from "@/contexts/PermissionContext";

import LayoutWrapper from "@/components/LayoutWrapper";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import "../globals.css";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://civify.cv"),
  title: "Civify - AI CV Builder with ATS Optimization | 92% Match Rate",
  description:
    "75% of CVs never get seen by humans. Civify uses AI to analyze job descriptions and tailor your CV for ATS systems. Full Arabic support. Start free, no credit card required.",
  keywords: [
    "AI CV builder",
    "ATS resume optimization",
    "Arabic resume builder",
    "CV tailoring",
    "resume match score",
    "job description analyzer",
    "ATS-friendly CV",
    "CV masking",
    "multilingual CV",
    "Arabic OCR CV",
  ],
  authors: [{ name: "Civify" }],
  creator: "Civify",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_SA",
    url: "https://civify.cv",
    siteName: "Civify",
    title: "Civify - AI CV Builder | Make Your CV Get Seen",
    description:
      "75% of CVs are rejected by ATS. Civify uses AI to tailor your CV, achieving 92% average match scores. Full Arabic support.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Civify - AI-Powered CV Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Civify - AI CV Builder with ATS Optimization",
    description:
      "75% of CVs never get seen. Make yours the exception with AI-powered optimization. 92% match rate. Full Arabic support.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // JSON-LD Structured Data for Software Application
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Civify",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "AI-powered CV builder with ATS optimization and full Arabic support.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
  };

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ServiceWorkerRegister />
        <ThemeProvider>
          <QueryProvider>
            <PermissionProvider>
              <NextIntlClientProvider messages={messages}>
                <LayoutWrapper>{children}</LayoutWrapper>
              </NextIntlClientProvider>
            </PermissionProvider>
          </QueryProvider>
        </ThemeProvider>
        <AnalyticsProvider />
      </body>
    </html>
  );
}
