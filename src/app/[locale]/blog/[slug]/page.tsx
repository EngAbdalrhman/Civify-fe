import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchPostBySlug, fetchPublishedSlugs } from "@/api/blog";
import BlogPostContent from "@/features/blog/components/BlogPostContent";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const post = await fetchPostBySlug(slug);
  if (!post) notFound();

  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv"
  ).replace(/\/$/, "");

  const description =
    post.metaDescription || post.excerpt || post.title;
  const keywords = post.metaKeywords
    ? post.metaKeywords.split(",").map((k) => k.trim())
    : undefined;

  return {
    title: post.title,
    description,
    keywords,
    authors: post.author ? [{ name: post.author }] : [{ name: "Civify" }],
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `${baseUrl}/${locale}/blog/${slug}`,
      siteName: "Civify",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_SA",
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author] : ["Civify"],
      ...(post.coverImage && {
        images: [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(post.coverImage && { images: [post.coverImage] }),
    },
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        en: `/en/blog/${slug}`,
        ar: `/ar/blog/${slug}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const slugs = await fetchPublishedSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  setRequestLocale(locale);

  const post = await fetchPostBySlug(slug);
  if (!post) notFound();

  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv"
  ).replace(/\/$/, "");

  // Article JSON-LD structured data for rich search results
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt || post.title,
    url: `${baseUrl}/${locale}/blog/${slug}`,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author || "Civify",
    },
    publisher: {
      "@type": "Organization",
      name: "Civify",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/civify-logo-simple.png`,
      },
    },
    ...(post.coverImage && {
      image: {
        "@type": "ImageObject",
        url: post.coverImage,
        width: 1200,
        height: 630,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogPostContent post={post} locale={locale} />
    </>
  );
}
