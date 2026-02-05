import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone", // Required for Docker deployment
  // Required: Prevents Next.js from bundling the puppeteer library
  serverExternalPackages: ["puppeteer-core"],
};

export default withNextIntl(nextConfig);
