import { MetadataRoute } from "next";
import { getPathname, routing } from "@/i18n/routing";

// Ensure the host doesn't have a trailing slash to prevent double slashes (e.g., //en)
const host = (process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv").replace(
  /\/$/,
  "",
);

export default function sitemap(): MetadataRoute.Sitemap {
  // 1. Define your routes in a single array to avoid repetition
  const routes = [
    { href: "/", changeFrequency: "weekly", priority: 1 },
    { href: "/plans", changeFrequency: "weekly", priority: 0.9 },
    { href: "/api-docs", changeFrequency: "weekly", priority: 0.8 },
    { href: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { href: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { href: "/policy", changeFrequency: "yearly", priority: 0.3 },
    { href: "/policy/cancellation", changeFrequency: "yearly", priority: 0.3 },
  ] as const;

  // 2. Use flatMap to generate entries for every locale for every route
  return routes.flatMap((route) => {
    return routing.locales.map((locale) => {
      // Resolve the URL for the current locale
      // Cast href to 'any' to avoid TS errors if your routing config is strictly typed
      const href = route.href as any;

      return {
        url: `${host}${getPathname({ locale, href })}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency as
          | "weekly"
          | "monthly"
          | "yearly",
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [
              l,
              `${host}${getPathname({ locale: l, href })}`,
            ]),
          ),
        },
      };
    });
  });
}
