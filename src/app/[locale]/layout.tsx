import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  setRequestLocale,
  getTranslations,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import LayoutWrapper from "@/components/LayoutWrapper";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import "../globals.css";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import { JsonLd } from "@/components/seo/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "metadata" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv";

  return {
    metadataBase: new URL(baseUrl),
    verification: {
      other: {
        "msvalidate.01": "143872F0A850B77A1ACBD2E4D2CBA1B0",
      },
    },
    title: {
      default: t("title"),
      template: `%s`,
    },
    description: t("description"),
    keywords: t("keywords")
      .split(",")
      .map((k) => k.trim()),
    authors: [{ name: "Civify" }],
    creator: "Civify",
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_SA",
      url: "https://civify.cv",
      siteName: "Civify",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Civify - AI-Powered Resume Builder",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      images: ["/og-image.png"],
    },
  };
}

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

  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv"
  ).replace(/\/$/, "");

  // JSON-LD Structured Data — multiple types for rich AI & search engine discovery
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Civify",
      url: baseUrl,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Resume Builder",
      operatingSystem: "Web",
      browserRequirements: "Requires a modern web browser",
      softwareVersion: "1.0",
      inLanguage: ["en", "ar"],
      offers: [
        {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          name: "Free Plan",
          description:
            "Basic resume building with limited AI generations per month",
        },
        {
          "@type": "Offer",
          price: "9.99",
          priceCurrency: "USD",
          name: "Pro Plan",
          description:
            "Unlimited AI tailoring, advanced ATS scoring, priority support",
        },
      ],
      description:
        "AI-powered resume builder and CV tailoring platform with ATS score insights, keyword matching, Arabic + RTL support, and PDF/DOCX export.",
      featureList: [
        "AI Resume Generation",
        "CV Tailoring for Job Descriptions",
        "ATS Compatibility Scoring",
        "Resume Match Score",
        "Arabic Language Support with RTL",
        "Professional PDF Export",
        "Chrome Extension for LinkedIn",
        "Privacy-First Design",
        "Resume Keyword Optimization",
        "Drag-and-Drop Resume Editor",
      ],
      screenshot: `${baseUrl}/og-image.png`,
      author: {
        "@type": "Organization",
        name: "Civify",
        url: baseUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Civify",
      url: baseUrl,
      logo: `${baseUrl}/civify-logo-simple.png`,
      description:
        "Civify is an AI-powered platform that helps job seekers build, tailor, and optimize resumes for specific job descriptions.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: `${baseUrl}/${locale}/contact`,
        availableLanguage: ["English", "Arabic"],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Civify",
      url: baseUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/${locale}/plans`,
        description: "Find the right resume building plan",
      },
    },
  ];

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <JsonLd data={jsonLd} />
        <ServiceWorkerRegister />
        <ThemeProvider>
          <QueryProvider>
            <NextIntlClientProvider messages={messages}>
              <LayoutWrapper>{children}</LayoutWrapper>
            </NextIntlClientProvider>
          </QueryProvider>
        </ThemeProvider>
        <AnalyticsProvider />
      </body>
    </html>
  );
}
