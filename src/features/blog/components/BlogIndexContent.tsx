"use client";

import { ArrowRight, Clock, Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { BlogListItem } from "@/types/blog";

interface BlogIndexContentProps {
  posts: BlogListItem[];
}

export default function BlogIndexContent({ posts }: BlogIndexContentProps) {
  const t = useTranslations("blog");

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50/40 to-background py-20 dark:from-gray-900/60 dark:to-background md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="container mx-auto px-4 py-16">
        {posts.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            <p className="text-lg">{t("noPosts")}</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function BlogCard({ post }: { post: BlogListItem }) {
  const t = useTranslations("blog");

  return (
    <Card className="group overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/10">
      <CardContent className="p-0">
        {/* Cover image */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-purple-900/20">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl">📝</span>
            </div>
          )}
          {post.featured && (
            <div className="absolute left-3 top-3">
              <Badge variant="default" className="text-xs">
                {t("featured")}
              </Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta row */}
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {t("readingTime", { time: post.readingTime })}
              </span>
            )}
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.publishedAt).toLocaleDateString()}
              </span>
            )}
            {post.author && (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {post.author}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="mb-3 line-clamp-2 text-xl font-bold transition-colors group-hover:text-primary">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.metaDescription && (
            <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
              {post.metaDescription}
            </p>
          )}

          {/* Read more */}
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            {t("readMore")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
