import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { blogService } from "@/services/blog.service";
import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import Image from "next/image";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const t = await getTranslations({ locale, namespace: "blog.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function BlogIndexPage({
  params,
}: Props) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const posts = await blogService.getPublishedPosts();

  return (
    <div className="container max-w-6xl py-12 md:py-24 space-y-12">
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {t("title")}
        </h1>
        <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground text-lg">{t("noPosts")}</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${locale}/blog/${post.slug}`}
              className="group rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              {post.coverImageUrl && (
                <div className="aspect-video relative w-full overflow-hidden bg-muted">
                  <Image
                    src={post.coverImageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {post.featured && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-medium">
                      {t("featured")}
                    </div>
                  )}
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-muted-foreground line-clamp-3 mb-4 flex-1">
                  {post.metaDescription}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-4 border-t">
                  <div className="flex items-center gap-4">
                    {post.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString(locale, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {post.readingTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readingTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CTA Section inside Blog */}
      <div className="mt-20 rounded-2xl bg-primary/5 p-8 md:p-12 text-center border border-primary/10">
        <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t("cta.subtitle")}
        </p>
        <Link
          href={`/${locale}/signup`}
          className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          {t("cta.button")}
        </Link>
      </div>
    </div>
  );
}
