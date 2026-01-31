import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone", // Required for Docker deployment
  images: {
    unoptimized: true, // Disable sharp dependency for SSG builds
  },
};

export default withNextIntl(nextConfig);
