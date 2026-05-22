import { installSsrDispatcher } from "@/lib/ssr-dispatcher";

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

export type BlogFetchResult<T> =
  | { ok: true; data: T; failed: false }
  | { ok: false; data: T; failed: true };

const isServer = typeof window === "undefined";
const DEFAULT_PUBLIC_API_URL = "https://civify.cv/apis";
const API_PATH = "/apis";
export const REVALIDATE_SECONDS = 300;
const FETCH_RETRIES = 3;
const FETCH_RETRY_DELAY_MS = 250;

function normalizeUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, "") : undefined;
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

export function getPublicBlogApiBaseUrl(): string {
  const configuredApiUrl = normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  const derivedApiUrl = apiUrlFromFrontendBase(
    process.env.NEXT_PUBLIC_BASE_URL,
  );
  if (configuredApiUrl) return configuredApiUrl;
  if (derivedApiUrl) return derivedApiUrl;
  return DEFAULT_PUBLIC_API_URL;
}

export function getBlogApiBaseUrl(): string {
  if (isServer) {
    const serverApiUrl =
      normalizeUrl(process.env.SERVER_API_URL) ??
      normalizeUrl(process.env.INTERNAL_API_URL);
    if (serverApiUrl) return serverApiUrl;
  }
  return getPublicBlogApiBaseUrl();
}

function isRetryableFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const cause = error.cause as { code?: string } | undefined;
  const code = cause?.code ?? "";
  return (
    error.message.includes("fetch failed") ||
    code === "EAI_AGAIN" ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT"
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function blogFetch(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<Response> {
  if (isServer) {
    await installSsrDispatcher();
  }

  const baseUrl = getBlogApiBaseUrl();
  const url = `${baseUrl}${path}`;
  let lastError: unknown;

  for (let attempt = 0; attempt < FETCH_RETRIES; attempt++) {
    try {
      const { next: nextInit, ...rest } = init ?? {};
      return await fetch(url, {
        ...rest,
        next: { revalidate: REVALIDATE_SECONDS, ...nextInit },
      });
    } catch (error) {
      lastError = error;
      if (!isRetryableFetchError(error) || attempt === FETCH_RETRIES - 1) {
        throw error;
      }
      await sleep(FETCH_RETRY_DELAY_MS * (attempt + 1));
    }
  }

  throw lastError;
}

function mapListItem(raw: Record<string, unknown>): PublicBlogPost {
  return {
    id: Number(raw.id),
    title: String(raw.title ?? ""),
    slug: String(raw.slug ?? ""),
    metaDescription: String(raw.metaDescription ?? ""),
    metaKeywords: String(raw.metaKeywords ?? ""),
    coverImageUrl: String(raw.coverImageUrl ?? ""),
    readingTime: String(raw.readingTime ?? ""),
    published: Boolean(raw.published),
    featured: Boolean(raw.featured),
    publishedAt: String(raw.publishedAt ?? ""),
    authorName: String(raw.authorName ?? raw.author ?? "Civify Team"),
  };
}

function mapDetails(raw: Record<string, unknown>): PublicBlogDetails {
  return {
    ...mapListItem(raw),
    content: String(raw.content ?? ""),
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

async function parseListResponse(res: Response): Promise<PublicBlogPost[]> {
  const json = (await res.json()) as Record<string, unknown>[];
  return json.map((item) => mapListItem(item));
}

export const blogService = {
  async getPublishedPosts(): Promise<PublicBlogPost[]> {
    try {
      const res = await blogFetch("/v1/blogs");
      if (!res.ok) throw new Error("Failed to fetch published posts");
      return await parseListResponse(res);
    } catch (error) {
      console.error("Error fetching published posts:", error);
      if (process.env.IS_BUILD === "true") return [];
      throw error;
    }
  },

  async getFeaturedPosts(): Promise<PublicBlogPost[]> {
    try {
      const res = await blogFetch("/v1/blogs/featured");
      if (!res.ok) throw new Error("Failed to fetch featured posts");
      return await parseListResponse(res);
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      if (process.env.IS_BUILD === "true") return [];
      throw error;
    }
  },

  async getFeaturedPostsSafe(): Promise<BlogFetchResult<PublicBlogPost[]>> {
    try {
      const data = await this.getFeaturedPosts();
      return { ok: true, data, failed: false };
    } catch (error) {
      console.error("Error fetching featured posts (safe):", error);
      if (process.env.IS_BUILD === "true") {
        return { ok: true, data: [], failed: false };
      }
      return { ok: false, data: [], failed: true };
    }
  },

  async getPostBySlug(slug: string): Promise<PublicBlogDetails | null> {
    try {
      const res = await blogFetch(`/v1/blogs/${encodeURIComponent(slug)}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch post with slug: ${slug}`);
      }
      const raw = (await res.json()) as Record<string, unknown>;
      return mapDetails(raw);
    } catch (error) {
      console.error(`Error fetching post by slug ${slug}:`, error);
      if (process.env.IS_BUILD === "true") return null;
      throw error;
    }
  },

  async getAllSlugs(): Promise<string[]> {
    try {
      const res = await blogFetch("/v1/blogs/slugs");
      if (!res.ok) throw new Error("Failed to fetch slugs");
      return await res.json();
    } catch (error) {
      console.error("Error fetching slugs:", error);
      if (process.env.IS_BUILD === "true") return [];
      throw error;
    }
  },
};
