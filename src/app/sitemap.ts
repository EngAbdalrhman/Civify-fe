import { MetadataRoute } from "next";
import { getPathname } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

const host = process.env.NEXT_PUBLIC_BASE_URL || "https://civify.io";

// Helper function to generate entries with all locale alternates
function getEntry(
  href: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap {
  // Generate one entry per locale
  return routing.locales.map((locale) => ({
    url: host + getPathname({ locale, href }),
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l,
          host + getPathname({ locale: l, href }),
        ]),
      ),
    },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getEntry("/", "weekly", 1),
    ...getEntry("/plans", "weekly", 0.9),
    ...getEntry("/api-docs", "weekly", 0.8),
    ...getEntry("/contact", "monthly", 0.7),
    ...getEntry("/terms", "yearly", 0.3),
    ...getEntry("/policy", "yearly", 0.3),
    ...getEntry("/policy/cancellation", "yearly", 0.3),
  ];
}
