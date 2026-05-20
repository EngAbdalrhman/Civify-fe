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
const PUBLIC_API = (process.env.NEXT_PUBLIC_API_URL ?? "https://civify.cv/apis").replace(/\/$/, "");
const INTERNAL_API = process.env.INTERNAL_API_URL ? process.env.INTERNAL_API_URL.replace(/\/$/, "") : PUBLIC_API;
const BASE_URL = isServer ? INTERNAL_API : PUBLIC_API;

const REVALIDATE_SECONDS = 60;

if (isServer) {
  console.log(`[Blog Service] Using Base URL for SSR: ${BASE_URL}`);
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
