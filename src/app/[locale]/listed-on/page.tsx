import ListedOnContent from "@/features/listed-on/components/ListedOnContent";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "metadata.listedOn",
  });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv";

  return {
    title: t("title"),
    description: t("description"),
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${baseUrl}/${locale}/listed-on`,
    },
    alternates: {
      canonical: `/${locale}/listed-on`,
      languages: {
        en: "/en/listed-on",
        ar: "/ar/listed-on",
      },
    },
  };
}

export default function ListedOnPage() {
  return <ListedOnContent />;
}
