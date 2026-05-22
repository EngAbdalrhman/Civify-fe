import { readFile } from "fs/promises";
import path from "path";
import type { WatermarkConfig } from "@/features/resume-builder/types/watermark";

const LOCAL_WATERMARK_PNG = path.join(
  process.cwd(),
  "public",
  "brand",
  "watermark.png",
);

function isPlatformBrandWatermarkUrl(imageUrl: string): boolean {
  return imageUrl.includes("/brand/watermark");
}

/**
 * Inline watermark as a data URI so Puppeteer does not depend on external HTTP
 * (presigned R2, wrong frontend host, etc.).
 */
export async function embedWatermarkImage(
  config: WatermarkConfig | undefined,
): Promise<WatermarkConfig | undefined> {
  if (!config?.enabled || !config.imageUrl) {
    return config;
  }

  if (config.imageUrl.startsWith("data:")) {
    return config;
  }

  const usePlatformFallback = isPlatformBrandWatermarkUrl(config.imageUrl);

  try {
    if (usePlatformFallback) {
      const embedded = await embedLocalPng();
      if (embedded) {
        return { ...config, imageUrl: embedded };
      }
    }

    const res = await fetch(config.imageUrl, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn(
        `Watermark image fetch failed: ${res.status} ${config.imageUrl}`,
      );
      if (usePlatformFallback) {
        return await fallbackLocalPng(config);
      }
      // Custom branding URL — do not substitute Civify platform logo
      return config;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/png";
    return {
      ...config,
      imageUrl: `data:${contentType};base64,${buffer.toString("base64")}`,
    };
  } catch (error) {
    console.warn("Watermark embed failed:", error);
    if (usePlatformFallback) {
      return await fallbackLocalPng(config);
    }
    return config;
  }
}

async function embedLocalPng(): Promise<string | null> {
  try {
    const bytes = await readFile(LOCAL_WATERMARK_PNG);
    return `data:image/png;base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

async function fallbackLocalPng(
  config: WatermarkConfig,
): Promise<WatermarkConfig> {
  const embedded = await embedLocalPng();
  if (embedded) {
    return { ...config, imageUrl: embedded };
  }
  console.error(
    `Missing ${LOCAL_WATERMARK_PNG} — add public/brand/watermark.png to the frontend image`,
  );
  return config;
}
