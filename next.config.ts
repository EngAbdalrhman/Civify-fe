import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  async headers() {
    return [{ source: "/:locale/mcp/connect", headers: [
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Cache-Control", value: "no-store" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
    ] }];
  },
  serverExternalPackages: ["puppeteer-core"],
  experimental: {
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/technolabs/**",
      },
    ],
  },

  // 👇 MOVED TO ROOT (Stable in Next.js 16)
  turbopack: {
    resolveAlias: {
      "node:inspector": "inspector",
    },
  },

  // Keep Webpack as a fallback (Turbopack ignores this, but it's safe)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "node:inspector": "inspector",
    };
    return config;
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: "civify-2g",
  project: "civify",
  sentryUrl: "https://de.sentry.io/",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: false,
});
