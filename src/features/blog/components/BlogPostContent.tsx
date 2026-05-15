"use client";

import { ArrowLeft, ArrowRight, Clock, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { BlogPost } from "@/types/blog";

interface BlogPostContentProps {
  post: BlogPost;
  locale: string;
}

export default function BlogPostContent({ post, locale }: BlogPostContentProps) {
  const t = useTranslations("blog");
  const isRtl = locale === "ar";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <main className="min-h-screen bg-background">
      {/* Cover image */}
      {post.coverImage && (
        <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-purple-900/20 md:h-96">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="container mx-auto max-w-3xl px-4 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <BackIcon className="h-4 w-4" />
          {t("backToBlog")}
        </Link>

        {/* Article header */}
        <article>
          <header className="mb-10">
            {post.featured && (
              <Badge variant="default" className="mb-4">
                {t("featured")}
              </Badge>
            )}

            <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {t("by")} {post.author}
                </span>
              )}
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {t("publishedOn")}{" "}
                  {new Date(post.publishedAt).toLocaleDateString(
                    locale === "ar" ? "ar-SA" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                </span>
              )}
              {post.readingTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {t("readingTime", { time: post.readingTime })}
                </span>
              )}
            </div>

            {/* Excerpt / description */}
            {(post.excerpt || post.metaDescription) && (
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {post.excerpt || post.metaDescription}
              </p>
            )}
          </header>

          {/* Body */}
          <div
            className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg"
            // Content comes from our own backend — safe to render as HTML
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-8 text-center dark:from-gray-900/50 dark:to-purple-900/20">
          <h2 className="mb-3 text-2xl font-bold">{t("cta.title")}</h2>
          <p className="mb-6 text-muted-foreground">{t("cta.subtitle")}</p>
          <Button asChild size="lg">
            <Link href="/signup">{t("cta.button")}</Link>
          </Button>
        </div>

        {/* Back to blog */}
        <div className="mt-10 text-center">
          <Button asChild variant="ghost">
            <Link href="/blog" className="inline-flex items-center gap-2">
              <BackIcon className="h-4 w-4" />
              {t("backToBlog")}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
