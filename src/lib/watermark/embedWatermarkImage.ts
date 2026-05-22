import { readFile } from "fs/promises";
import path from "path";
import type { WatermarkConfig } from "@/features/resume-builder/types/watermark";

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

  try {
    if (config.imageUrl.includes("/brand/watermark")) {
      const localSvg = path.join(process.cwd(), "public", "brand", "watermark.svg");
      const svgBytes = await readFile(localSvg);
      return {
        ...config,
        imageUrl: `data:image/svg+xml;base64,${svgBytes.toString("base64")}`,
      };
    }

    const res = await fetch(config.imageUrl, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      console.warn(
        `Watermark image fetch failed: ${res.status} ${config.imageUrl}`,
      );
      return await fallbackLocalSvg(config);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/png";
    return {
      ...config,
      imageUrl: `data:${contentType};base64,${buffer.toString("base64")}`,
    };
  } catch (error) {
    console.warn("Watermark embed failed, using local fallback:", error);
    return await fallbackLocalSvg(config);
  }
}

async function fallbackLocalSvg(
  config: WatermarkConfig,
): Promise<WatermarkConfig> {
  try {
    const localSvg = path.join(process.cwd(), "public", "brand", "watermark.svg");
    const svgBytes = await readFile(localSvg);
    return {
      ...config,
      imageUrl: `data:image/svg+xml;base64,${svgBytes.toString("base64")}`,
    };
  } catch {
    return config;
  }
}
