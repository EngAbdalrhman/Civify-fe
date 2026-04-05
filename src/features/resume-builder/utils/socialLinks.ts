/**
 * Normalizes a LinkedIn string into a clickable HTTPS URL.
 * Supports bare usernames, partial URLs, and full URLs.
 */
export function normalizeLinkedInUrl(raw: string): string {
  if (!raw) return "";

  const trimmed = raw.trim();

  // If it already looks like a valid http/https URL, return as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // If it contains linkedin.com but lacks protocol
  if (trimmed.includes("linkedin.com")) {
    return `https://${trimmed}`;
  }

  // Otherwise treat as a bare username/slug
  return `https://linkedin.com/in/${trimmed}`;
}

/**
 * Normalizes a GitHub string into a clickable HTTPS URL.
 * Supports bare usernames, partial URLs, and full URLs.
 */
export function normalizeGitHubUrl(raw: string): string {
  if (!raw) return "";

  const trimmed = raw.trim();

  // If it already looks like a valid http/https URL, return as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // If it contains github.com but lacks protocol
  if (trimmed.includes("github.com")) {
    return `https://${trimmed}`;
  }

  // Otherwise treat as a bare username/slug
  return `https://github.com/${trimmed}`;
}

/**
 * Normalizes a website URL for use in href attributes.
 */
export function normalizeWebsiteUrl(raw: string): string {
  if (!raw) return "";

  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
