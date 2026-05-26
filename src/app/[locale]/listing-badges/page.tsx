import ListingBadgesContent from "@/features/listing-badges/components/ListingBadgesContent";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "metadata.listingBadges",
  });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv";

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${baseUrl}/${locale}/listing-badges`,
    },
    twitter: {
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
    alternates: {
      canonical: `/${locale}/listing-badges`,
      languages: {
        en: "/en/listing-badges",
        ar: "/ar/listing-badges",
      },
    },
  };
}

export default function ListingBadgesPage() {
  return <ListingBadgesContent />;
}
