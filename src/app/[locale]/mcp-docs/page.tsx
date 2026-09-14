import McpDocsContent from "@/features/mcp-docs/components/McpDocsContent";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.mcp-docs" });
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv").replace(/\/$/, "");

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${baseUrl}/${locale}/mcp-docs`,
      siteName: "Civify",
      type: "article",
      locale: locale === "ar" ? "ar_AR" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_AR", "ar_EG", "ar_SA"],
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      images: [`${baseUrl}/og-image.png`],
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
    alternates: {
      canonical: `${baseUrl}/${locale}/mcp-docs`,
      languages: {
        en: `${baseUrl}/en/mcp-docs`,
        ar: `${baseUrl}/ar/mcp-docs`,
        "x-default": `${baseUrl}/en/mcp-docs`,
      },
    },
  };
}

export default async function McpDocsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const faqT = await getTranslations({ locale, namespace: "mcp-docs.faq" });
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv").replace(/\/$/, "");

  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Civify Model Context Protocol (MCP) Server",
      alternateName: "@civify/mcp-server",
      url: "https://mcp.civify.cv",
      downloadUrl: "https://www.npmjs.com/package/@civify/mcp-server",
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "AI Agent Tools",
      operatingSystem: "Cross-platform (Node.js, Docker, Remote SSE)",
      softwareVersion: "1.2.0",
      inLanguage: ["en", "ar"],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free Community Edition",
        description: "Open MCP tools for AI resume parsing, ATS scoring, and job tracking",
      },
      description:
        locale === "ar"
          ? "سيرفر بروتوكول سياق النموذج (MCP) لمنصة Civify يتيح لوكلاء الذكاء الاصطناعي (Claude Desktop و Cursor) تحليل السير الذاتية وتخصيصها وفحص ATS وتتبع الوظائف عبر 17 أداة."
          : "Official Model Context Protocol server for Civify AI Career Platform. Enables autonomous AI agents to parse resumes, tailor CVs against job descriptions, score ATS compatibility, redact PII, and track applications.",
      featureList: [
        "17 Automated Career AI Tools",
        "Remote SSE Transport (https://mcp.civify.cv/sse)",
        "Local stdio Transport (npx -y @civify/mcp-server)",
        "Resume Parsing (PDF, DOCX, base64, Arabic OCR)",
        "Job Description Scraping (LinkedIn, Greenhouse, Lever)",
        "AI Bullet Point Tailoring & Keyword Matching",
        "ATS Compatibility Scoring (0-100)",
        "PII Redaction for Blind Applications",
        "Kanban Application Pipeline Tracking",
        "Pay-Per-CV Regional Pricing (USD & EGP)",
      ],
      author: {
        "@type": "Organization",
        name: "Civify",
        url: baseUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline:
        locale === "ar"
          ? "دليل توثيق سيرفر Civify MCP لوكلاء الذكاء الاصطناعي"
          : "Civify Model Context Protocol (MCP) Server Integration Guide",
      description:
        locale === "ar"
          ? "الدليل التقني الشامل لربط وكلاء الذكاء الاصطناعي بـ Civify عبر بروتوكول سياق النموذج (MCP)."
          : "Complete technical documentation for connecting Claude Desktop, Cursor, and autonomous AI agents to Civify career tools.",
      inLanguage: locale,
      url: `${baseUrl}/${locale}/mcp-docs`,
      author: {
        "@type": "Organization",
        name: "Civify Engineering Team",
        url: baseUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "Civify",
        url: baseUrl,
        logo: `${baseUrl}/civify-logo-simple.png`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "ar" ? "الرئيسية" : "Home",
          item: `${baseUrl}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: locale === "ar" ? "المطورون" : "Developers",
          item: `${baseUrl}/${locale}/api-docs`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: locale === "ar" ? "سيرفر MCP" : "MCP Server Documentation",
          item: `${baseUrl}/${locale}/mcp-docs`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqKeys.map((k) => ({
        "@type": "Question",
        name: faqT(`items.${k}.question`),
        acceptedAnswer: {
          "@type": "Answer",
          text: faqT(`items.${k}.answer`),
        },
      })),
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <McpDocsContent />
    </>
  );
}
