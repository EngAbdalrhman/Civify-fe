import type { WatermarkConfig } from "@/features/resume-builder/types/watermark";
import {
  DEFAULT_WATERMARK_OPACITY,
  DEFAULT_WATERMARK_POSITION,
  DEFAULT_WATERMARK_SCALE,
} from "@/features/resume-builder/types/watermark";

function getDefaultPlatformWatermark(baseUrl: string): WatermarkConfig {
  const origin = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const envLogo = process.env.WATERMARK_LOGO_URL;
  return {
    enabled: true,
    imageUrl: envLogo || `${origin}/brand/watermark.svg`,
    opacity: Number(process.env.WATERMARK_OPACITY) || DEFAULT_WATERMARK_OPACITY,
    scale: Number(process.env.WATERMARK_SCALE) || DEFAULT_WATERMARK_SCALE,
    position:
      (process.env.WATERMARK_POSITION as WatermarkConfig["position"]) ||
      DEFAULT_WATERMARK_POSITION,
  };
}

function buildAuthHeaders(request: Request): Headers {
  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  const authorization = request.headers.get("authorization");

  if (cookie) {
    headers.set("cookie", cookie);
    const tokenMatch = cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
    if (tokenMatch?.[1] && !authorization) {
      headers.set("authorization", `Bearer ${decodeURIComponent(tokenMatch[1])}`);
    }
  }
  if (authorization) {
    headers.set("authorization", authorization);
  }
  return headers;
}

export async function resolveWatermarkForRequest(
  request: Request,
  bodyWatermark?: WatermarkConfig,
): Promise<WatermarkConfig | undefined> {
  const internalToken = request.headers.get("x-pdf-internal-token");
  const pdfSecret = process.env.PDF_INTERNAL_SECRET;

  if (
    internalToken &&
    pdfSecret &&
    internalToken === pdfSecret &&
    bodyWatermark?.enabled &&
    bodyWatermark.imageUrl
  ) {
    return bodyWatermark;
  }

  const backendUrl =
    process.env.CIVIFY_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  const requestOrigin = new URL(request.url).origin;

  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/v1/pdf/watermark-config`, {
        headers: buildAuthHeaders(request),
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const config = json?.data as WatermarkConfig | undefined;
        if (config?.enabled && config.imageUrl) {
          return config;
        }
        if (config && !config.enabled) {
          console.info("PDF watermark disabled by policy for this user");
          return undefined;
        }
      } else {
        console.warn(
          `watermark-config returned ${res.status}, using default watermark`,
        );
      }
    } catch (error) {
      console.warn("Failed to resolve watermark from civify:", error);
    }
  }

  return getDefaultPlatformWatermark(requestOrigin);
}
