import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { blogService } from "@/services/blog.service";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Calendar, User } from "lucide-react";
import Image from "next/image";
import sanitizeHtml from "sanitize-html";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const post = await blogService.getPostBySlug(slug);
  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.metaKeywords ? post.metaKeywords.split(",").map(k => k.trim()) : [],
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.authorName || "Civify"],
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const slugs = await blogService.getAllSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export default async function BlogPostPage({
  params,
}: Props) {
  const { locale, slug } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const post = await blogService.getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const isRtl = locale === "ar";
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  // JSON-LD for Article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.coverImageUrl ? [post.coverImageUrl] : [],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: [
      {
        "@type": "Person",
        name: post.authorName || "Civify Team",
      },
    ],
    description: post.metaDescription,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto max-w-4xl py-12 md:py-16 space-y-8">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowIcon className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
          {t("backToBlog")}
        </Link>

        <article className="space-y-8">
          {/* Header */}
          <div className="space-y-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl lg:leading-[1.1]">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground text-sm">
              {post.authorName && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{post.authorName}</span>
                </div>
              )}
              {post.publishedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              {post.readingTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImageUrl && (
            <div className="aspect-[2/1] relative w-full overflow-hidden rounded-xl border bg-muted">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          {/* The prose classes are from @tailwindcss/typography. 
              We assume the content might be HTML provided from the admin dashboard.
              If it doesn't have Tailwind Typography plugin installed, standard classes can be used. */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary"
            dangerouslySetInnerHTML={{ 
              __html: sanitizeHtml(post.content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span']),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  '*': ['style', 'class']
                }
              }) 
            }}
          />
        </article>

        {/* CTA Footer */}
        <div className="mt-16 rounded-2xl bg-muted/50 p-8 text-center border">
          <h2 className="text-2xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("cta.subtitle")}
          </p>
          <Link
            href={`/${locale}/signup`}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            {t("cta.button")}
          </Link>
        </div>
      </div>
    </>
  );
}
