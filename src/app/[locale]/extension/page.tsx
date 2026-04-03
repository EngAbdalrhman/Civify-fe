import {
  ExtensionHeroSection,
  ProblemSolutionSection,
  FeatureHighlightsSection,
  ExtensionHowItWorksSection,
  ExtensionTutorialVideoSection,
  LanguageSection,
  PrivacySecuritySection,
  ExtensionTestimonialsSection,
  ComparisonTableSection,
  ExtensionFAQSection,
  ExtensionCTASection,
} from "@/features/extension-page/components";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "extension.metadata" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv";

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_SA",
      url: `${baseUrl}/${locale}/extension`,
      siteName: "Civify",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Civify CV Browser Extension",
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
      canonical: `/${locale}/extension`,
      languages: {
        en: "/en/extension",
        ar: "/ar/extension",
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ExtensionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "extension.faq" });
  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ExtensionHeroSection />
      <ProblemSolutionSection />
      <FeatureHighlightsSection />
      <ExtensionHowItWorksSection />
      <ExtensionTutorialVideoSection />
      <LanguageSection />
      <PrivacySecuritySection />
      {/*<ExtensionTestimonialsSection />*/}
      <ComparisonTableSection />
      <ExtensionFAQSection />
      <ExtensionCTASection />
    </>
  );
}
