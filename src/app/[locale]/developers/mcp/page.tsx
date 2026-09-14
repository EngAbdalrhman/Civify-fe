import McpDocsContent from "@/features/mcp-docs/components/McpDocsContent";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.mcp-docs" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv";

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${baseUrl}/${locale}/mcp-docs`,
    },
    twitter: {
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
    alternates: {
      canonical: `/${locale}/mcp-docs`,
      languages: {
        en: "/en/mcp-docs",
        ar: "/ar/mcp-docs",
      },
    },
  };
}

export default function DevelopersMcpPage() {
  return <McpDocsContent />;
}
