const DEFAULT_CONTEXT = "https://schema.org";

/**
 * Sanitizes JSON-LD nodes before injection so missing @context never breaks
 * runtime validators (e.g. r["@context"].toLowerCase on undefined).
 */
export function sanitizeJsonLd(data: unknown): unknown | null {
  if (data == null) return null;

  if (Array.isArray(data)) {
    const items = data
      .map((item) => sanitizeJsonLd(item))
      .filter((item) => item != null);
    return items.length > 0 ? items : null;
  }

  if (typeof data !== "object") {
    return data;
  }

  const source = data as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (key === "@context") {
      if (typeof value === "string" && value.trim()) {
        result["@context"] = value.trim();
      } else if (value != null && typeof value === "object") {
        result["@context"] = value;
      }
      continue;
    }

    if (value == null) continue;

    if (Array.isArray(value)) {
      const next = value
        .map((item) => sanitizeJsonLd(item))
        .filter((item) => item != null);
      if (next.length > 0) result[key] = next;
      continue;
    }

    if (typeof value === "object") {
      const next = sanitizeJsonLd(value);
      if (next != null) result[key] = next;
      continue;
    }

    result[key] = value;
  }

  const hasType = typeof result["@type"] === "string" && result["@type"].length > 0;
  const hasContext =
    typeof result["@context"] === "string" ||
    (result["@context"] != null && typeof result["@context"] === "object");

  if (hasType && !hasContext) {
    result["@context"] = DEFAULT_CONTEXT;
  }

  if (Object.keys(result).length === 0) return null;

  return result;
}

/** Safe JSON-LD string for dangerouslySetInnerHTML (escapes `<`). */
export function serializeJsonLd(data: unknown): string | null {
  const sanitized = sanitizeJsonLd(data);
  if (sanitized == null) return null;

  try {
    return JSON.stringify(sanitized).replace(/</g, "\\u003c");
  } catch {
    return null;
  }
}
