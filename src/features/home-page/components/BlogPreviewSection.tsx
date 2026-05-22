import { ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { fetchFeaturedPosts } from "@/api/blog";
import type { BlogListItem } from "@/types/blog";

export async function BlogPreviewSection() {
  const t = await getTranslations("blog");
  const { posts, failed } = await fetchFeaturedPosts();

  if (posts.length === 0 && !failed) {
    return null;
  }

  if (failed) {
    return (
      <section className="bg-gradient-to-b from-blue-50/30 to-background py-20 dark:from-gray-900 dark:to-background md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </section>
    );
  }

  const displayPosts = posts.slice(0, 3);

  return (
    <section className="bg-gradient-to-b from-blue-50/30 to-background py-20 dark:from-gray-900 dark:to-background md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {displayPosts.map((post) => (
            <BlogPreviewCard key={post.id} post={post} readMoreLabel={t("readMore")} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/blog">
              {t("readMore")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function BlogPreviewCard({
  post,
  readMoreLabel,
}: {
  post: BlogListItem;
  readMoreLabel: string;
}) {
  return (
    <Card className="group overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/10">
      <CardContent className="p-0">
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-purple-900/20">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">📝</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="p-6">
          {post.readingTime && (
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime}</span>
            </div>
          )}

          <h3 className="mb-3 line-clamp-2 text-xl font-bold transition-colors group-hover:text-primary">
            {post.title}
          </h3>

          {post.metaDescription && (
            <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
              {post.metaDescription}
            </p>
          )}

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            {readMoreLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
