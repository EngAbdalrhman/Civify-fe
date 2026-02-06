import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone", // Required for Docker deployment
  // Prevents Next.js from bundling puppeteer-core (moved from experimental in Next.js 15+)
  serverExternalPackages: ["puppeteer-core"],
};

export default withNextIntl(nextConfig);
