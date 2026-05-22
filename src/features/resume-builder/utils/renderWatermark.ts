import type { WatermarkConfig, WatermarkPosition } from "@/features/resume-builder/types/watermark";
import {
  DEFAULT_WATERMARK_OPACITY,
  DEFAULT_WATERMARK_POSITION,
  DEFAULT_WATERMARK_SCALE,
} from "@/features/resume-builder/types/watermark";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function positionStyles(position: WatermarkPosition): string {
  switch (position) {
    case "bottom-right":
      return "bottom: 8%; right: 6%; top: auto; left: auto; transform: none;";
    case "bottom-left":
      return "bottom: 8%; left: 6%; top: auto; right: auto; transform: none;";
    case "top-right":
      return "top: 8%; right: 6%; bottom: auto; left: auto; transform: none;";
    case "top-left":
      return "top: 8%; left: 6%; bottom: auto; right: auto; transform: none;";
    case "center":
    default:
      return "inset: 0; display: flex; align-items: center; justify-content: center;";
  }
}

export function renderWatermarkOverlay(config: WatermarkConfig): string {
  if (!config.enabled || !config.imageUrl) {
    return "";
  }

  const opacity = config.opacity ?? DEFAULT_WATERMARK_OPACITY;
  const scale = config.scale ?? DEFAULT_WATERMARK_SCALE;
  // Ensure visible on white PDF backgrounds (0.12 alone is often invisible)
  const effectiveOpacity = Math.max(opacity, 0.18);
  const position = config.position ?? DEFAULT_WATERMARK_POSITION;
  const rotation = config.rotation ?? 0;
  const imageUrl = escapeHtml(config.imageUrl);

  const isCenter = position === "center";
  const transform = isCenter
    ? `rotate(${rotation}deg)`
    : `rotate(${rotation}deg)`;

  const imgStyle = isCenter
    ? `max-width: ${scale * 100}%; height: auto; opacity: ${effectiveOpacity}; transform: ${transform};`
    : `max-width: ${scale * 60}%; height: auto; opacity: ${effectiveOpacity}; transform: ${transform};`;

  return `
    <div id="pdf-watermark-overlay" style="
      position: fixed;
      ${positionStyles(position)}
      pointer-events: none;
      z-index: 9999;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    ">
      <img src="${imageUrl}" alt="" style="${imgStyle}" />
    </div>
  `.trim();
}
