/**
 * Fixes blog HTML pasted from JSON/API examples into the admin textarea
 * (e.g. `\"quote\"` and `\\n` showing literally on the public page).
 */
export function normalizeBlogHtml(content: string): string {
  if (!content) return content;

  let normalized = content.trim();

  // Whole field was JSON-stringified once (starts/ends with quotes).
  if (normalized.startsWith('"') && normalized.endsWith('"')) {
    try {
      normalized = JSON.parse(normalized) as string;
    } catch {
      // fall through to partial unescape
    }
  }

  if (
    normalized.includes('\\"') ||
    normalized.includes("\\'") ||
    normalized.includes("\\n") ||
    normalized.includes("\\r")
  ) {
    normalized = normalized
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\\\/g, "\\");
  }

  return normalized;
}
