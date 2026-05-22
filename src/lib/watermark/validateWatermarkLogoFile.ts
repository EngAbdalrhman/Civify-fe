/** Must match civify {@code BucketService.MAX_WATERMARK_BYTES} (512_000). */
export const MAX_WATERMARK_LOGO_BYTES = 512_000;

export const MAX_WATERMARK_LOGO_KB = 500;

export const WATERMARK_LOGO_ACCEPT = "image/png";

export const WATERMARK_LOGO_HINT = `PNG only, max ${MAX_WATERMARK_LOGO_KB}KB`;

/**
 * Client-side checks before upload. Backend enforces the same rules in uploadUserLogo.
 * @returns Error message, or null if the file is allowed.
 */
export function validateWatermarkLogoFile(file: File): string | null {
  if (file.size > MAX_WATERMARK_LOGO_BYTES) {
    return `Logo must be ${MAX_WATERMARK_LOGO_KB}KB or smaller (this file is ${Math.round(file.size / 1024)}KB). Compress the PNG and try again.`;
  }
  if (file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
    return "Logo must be a PNG file.";
  }
  return null;
}
