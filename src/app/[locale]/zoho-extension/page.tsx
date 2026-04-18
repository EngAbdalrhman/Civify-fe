import {
  ZohoHeroSection,
  ZohoFeaturesSection,
  ZohoHowItWorksSection,
  ZohoTutorialVideoSection,
  ZohoFAQSection,
  ZohoCTASection,
} from "@/features/zoho-extension-page/components";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "zoho-extension.metadata" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv";

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_SA",
      url: `${baseUrl}/${locale}/zoho-extension`,
      siteName: "Civify",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Civify for Zoho Recruit",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `/${locale}/zoho-extension`,
      languages: {
        en: "/en/zoho-extension",
        ar: "/ar/zoho-extension",
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ZohoExtensionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "zoho-extension.faq" });
  const faqKeys = ["q1", "q2", "q3"];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqKeys.map((key) => ({
      "@type": "Question",
      name: t(`items.${key}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`items.${key}.answer`),
      },
    })),
  };

  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Civify for Zoho Recruit Tutorial",
    description: "Learn how to parse resumes and assess candidates directly inside Zoho Recruit using Civify.",
    thumbnailUrl: ["https://img.youtube.com/vi/xknHfi87ils/maxresdefault.jpg"],
    uploadDate: "2024-05-15T08:00:00+08:00",
    embedUrl: "https://www.youtube.com/embed/xknHfi87ils"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      <div className="flex flex-col min-h-screen">
        <ZohoHeroSection />
        {/* <ZohoFeaturesSection /> */}
        <ZohoHowItWorksSection />
        <ZohoTutorialVideoSection />
        <ZohoFAQSection />
        <ZohoCTASection />
      </div>
    </>
  );
}
