import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

export default function robots(): MetadataRoute.Robots {
  const host = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv"
  ).replace(/\/$/, "");

  // The paths you requested to block
  const protectedPaths = [
    "/admin/",
    "/payment/",
    "/app/",
    "/checkout/",
    "/subscription/",
    "/api", // Blocks /api, /api/auth, etc.
  ];

  // Generate the full list including all locale prefixes
  const disallowList = protectedPaths.flatMap((route) => {
    return [
      route, // Block non-localized (e.g. /api)
      ...routing.locales.map((locale) => `/${locale}${route}`), // Block localized (e.g. /en/api)
    ];
  });

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: disallowList,
    },
    sitemap: `${host}/sitemap.xml`,
  };
}
