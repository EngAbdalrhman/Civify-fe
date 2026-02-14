import PolicyContent from "@/features/legal/components/PolicyContent";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.policy" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv";

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${baseUrl}/${locale}/policy`,
    },
    twitter: {
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
    alternates: {
      canonical: `/${locale}/policy`,
      languages: {
        en: "/en/policy",
        ar: "/ar/policy",
      },
    },
  };
}

export default function PolicyPage() {
  return <PolicyContent />;
}
