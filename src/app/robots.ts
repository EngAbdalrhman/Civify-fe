import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const host = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://civify.io"
  ).replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Disallow private routes if you have them, e.g., /account, /admin
      disallow: ["/private/", "/admin/", "/payment/", "/payment/*", "/api"],
    },
    // Crucial: Point Google to your dynamic sitemap
    sitemap: `${host}/sitemap.xml`,
  };
}
