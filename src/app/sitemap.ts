import type { MetadataRoute } from "next";
import { getPathname, routing } from "@/i18n/routing";
import { fetchPublishedSlugs } from "@/api/blog";

type SitemapRoute = {
  href:
    | "/"
    | "/plans"
    | "/api-docs"
    | "/mcp-docs"
    | "/contact"
    | "/terms"
    | "/policy"
    | "/policy/cancellation"
    | "/extension"
    | "/blog";
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
};

// Ensure the host doesn't have a trailing slash to prevent double slashes (e.g., //en)
const host = (process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv").replace(
  /\/$/,
  "",
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static routes
  const routes: SitemapRoute[] = [
    { href: "/", changeFrequency: "weekly", priority: 1 },
    { href: "/plans", changeFrequency: "weekly", priority: 0.9 },
    { href: "/api-docs", changeFrequency: "weekly", priority: 0.8 },
    { href: "/mcp-docs", changeFrequency: "weekly", priority: 0.8 },
    { href: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { href: "/blog", changeFrequency: "weekly", priority: 0.8 },
    { href: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { href: "/policy", changeFrequency: "yearly", priority: 0.3 },
    { href: "/policy/cancellation", changeFrequency: "yearly", priority: 0.3 },
    { href: "/extension", changeFrequency: "weekly", priority: 0.8 },
  ] as const;

  const staticEntries = routes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: `${host}${getPathname({ locale, href: route.href })}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [
            l,
            `${host}${getPathname({ locale: l, href: route.href })}`,
          ]),
        ),
      },
    })),
  );

  // 2. Dynamic blog post routes
  const slugs = await fetchPublishedSlugs();
  const blogEntries = slugs.flatMap((slug) =>
    routing.locales.map((locale) => ({
      url: `${host}/${locale}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${host}/${l}/blog/${slug}`]),
        ),
      },
    })),
  );

  return [...staticEntries, ...blogEntries];
}
