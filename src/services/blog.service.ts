export interface PublicBlogPost {
  id: number;
  title: string;
  slug: string;
  metaDescription: string;
  metaKeywords: string;
  coverImageUrl: string;
  readingTime: string;
  published: boolean;
  featured: boolean;
  publishedAt: string;
  authorName: string;
}

export interface PublicBlogDetails extends PublicBlogPost {
  content: string;
  createdAt: string;
  updatedAt: string;
}

const isServer = typeof window === "undefined";
const DEFAULT_PUBLIC_API_URL = "https://civify.cv/apis";
const API_PATH = "/apis";
const REVALIDATE_SECONDS = 60;

function normalizeUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, "") : undefined;
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return false;
  }

  const [first, second] = parts;

  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}

function isInternalApiUrl(apiUrl: string): boolean {
  try {
    const url = new URL(apiUrl);
    const hostname = url.hostname.toLowerCase();

    return (
      url.protocol !== "https:" ||
      hostname === "localhost" ||
      hostname === "::1" ||
      hostname.includes("civify-backend") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".local") ||
      (!hostname.includes(".") && !hostname.includes(":")) ||
      isPrivateIpv4(hostname)
    );
  } catch {
    return true;
  }
}

function apiUrlFromFrontendBase(
  baseUrl: string | undefined,
): string | undefined {
  const normalizedBaseUrl = normalizeUrl(baseUrl);

  if (!normalizedBaseUrl) return undefined;

  try {
    const url = new URL(normalizedBaseUrl);
    const pathname = url.pathname.replace(/\/+$/, "");

    url.pathname = pathname.endsWith(API_PATH)
      ? pathname
      : `${pathname}${API_PATH}`;
    url.search = "";
    url.hash = "";

    return normalizeUrl(url.toString());
  } catch {
    return undefined;
  }
}

export function getBlogApiBaseUrl(): string {
  const configuredApiUrl = normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  const derivedApiUrl = apiUrlFromFrontendBase(
    process.env.NEXT_PUBLIC_BASE_URL,
  );

  if (
    configuredApiUrl &&
    (process.env.NODE_ENV !== "production" ||
      !isInternalApiUrl(configuredApiUrl))
  ) {
    return configuredApiUrl;
  }

  if (
    derivedApiUrl &&
    (process.env.NODE_ENV !== "production" || !isInternalApiUrl(derivedApiUrl))
  ) {
    return derivedApiUrl;
  }

  return DEFAULT_PUBLIC_API_URL;
}

const BASE_URL = getBlogApiBaseUrl();

if (
  isServer &&
  process.env.NODE_ENV === "production" &&
  normalizeUrl(process.env.NEXT_PUBLIC_API_URL) &&
  normalizeUrl(process.env.NEXT_PUBLIC_API_URL) !== BASE_URL
) {
  console.warn(
    `[Blog Service] Ignoring internal blog API URL and using ${BASE_URL} for SSR.`,
  );
}

export const blogService = {
  /**
   * Get all published blog posts
   */
  async getPublishedPosts(): Promise<PublicBlogPost[]> {
    try {
      const res = await fetch(`${BASE_URL}/v1/blogs`, {
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) throw new Error("Failed to fetch published posts");
      return await res.json();
    } catch (error) {
      console.error("Error fetching published posts:", error);
      if (process.env.IS_BUILD === "true") return [];
      throw error;
    }
  },

  /**
   * Get featured blog posts
   */
  async getFeaturedPosts(): Promise<PublicBlogPost[]> {
    try {
      const res = await fetch(`${BASE_URL}/v1/blogs/featured`, {
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) throw new Error("Failed to fetch featured posts");
      return await res.json();
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      if (process.env.IS_BUILD === "true") return [];
      throw error;
    }
  },

  /**
   * Get a single published blog post by slug
   */
  async getPostBySlug(slug: string): Promise<PublicBlogDetails | null> {
    try {
      const res = await fetch(
        `${BASE_URL}/v1/blogs/${encodeURIComponent(slug)}`,
        {
          next: { revalidate: REVALIDATE_SECONDS },
        },
      );
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch post with slug: ${slug}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`Error fetching post by slug ${slug}:`, error);
      if (process.env.IS_BUILD === "true") return null;
      throw error;
    }
  },

  /**
   * Get all slugs for sitemap generation
   */
  async getAllSlugs(): Promise<string[]> {
    try {
      const res = await fetch(`${BASE_URL}/v1/blogs/slugs`, {
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) throw new Error("Failed to fetch slugs");
      return await res.json();
    } catch (error) {
      console.error("Error fetching slugs:", error);
      if (process.env.IS_BUILD === "true") return [];
      throw error;
    }
  },
};
