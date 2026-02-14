import ContactContent from "@/features/contact/components/ContactContent";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.contact" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv";

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${baseUrl}/${locale}/contact`,
    },
    twitter: {
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
    alternates: {
      canonical: `/${locale}/contact`,
      languages: {
        en: "/en/contact",
        ar: "/ar/contact",
      },
    },
  };
}

export default function ContactPage() {
  return <ContactContent />;
}
