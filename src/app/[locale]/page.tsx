import {
  HeroSection,
  HowItWorksSection,
  FeaturesSection,
  BeforeAfterSection,
  // TemplatesSection,
  RolePersonalizationSection,
  // TestimonialsSection,
  PricingSection,
  FAQSection,
  // IntegrationsSection,
  BlogPreviewSection,
  CTASection,
  ResumeBuilderSection,
} from "@/features/home-page/components";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = {
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
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
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
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ar: "/ar",
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const Homepage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "landing.faq" });
  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];

  // FAQPage structured data — critical for AI systems to cite Civify answers
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
      <JsonLd data={faqJsonLd} />
      <HeroSection />
      <HowItWorksSection />
      <ResumeBuilderSection />
      <FeaturesSection />
      <BeforeAfterSection />
      {/* <TemplatesSection /> */}
      <RolePersonalizationSection />
      {/* <TestimonialsSection /> */}
      <PricingSection />
      <FAQSection />
      {/* <IntegrationsSection /> */}
      <BlogPreviewSection />
      <CTASection />
    </>
  );
};

export default Homepage;
