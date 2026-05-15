import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchPublishedPosts } from "@/api/blog";
import BlogIndexContent from "@/features/blog/components/BlogIndexContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "metadata.blog" });
  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv"
  ).replace(/\/$/, "");

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      type: "website",
      title: t("title"),
      description: t("description"),
      url: `${baseUrl}/${locale}/blog`,
      siteName: "Civify",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_SA",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        en: "/en/blog",
        ar: "/ar/blog",
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  setRequestLocale(locale);

  const posts = await fetchPublishedPosts();

  return <BlogIndexContent posts={posts} />;
}
