import apiClient from "@/api/client";
import { BlogPost } from "@/features/home-page/types";

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

export const blogService = {
  /**
   * Get all published blog posts
   */
  async getPublishedPosts(): Promise<PublicBlogPost[]> {
    try {
      // Direct fetch to support SSR in Next.js App Router without token requirements
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${baseUrl}/v1/blogs/`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });
      if (!res.ok) throw new Error("Failed to fetch published posts");
      return await res.json();
    } catch (error) {
      console.error("Error fetching published posts:", error);
      return [];
    }
  },

  /**
   * Get featured blog posts
   */
  async getFeaturedPosts(): Promise<PublicBlogPost[]> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${baseUrl}/v1/blogs/featured`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) throw new Error("Failed to fetch featured posts");
      return await res.json();
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      return [];
    }
  },

  /**
   * Get a single published blog post by slug
   */
  async getPostBySlug(slug: string): Promise<PublicBlogDetails | null> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${baseUrl}/v1/blogs/${slug}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch post with slug: ${slug}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`Error fetching post by slug ${slug}:`, error);
      return null;
    }
  },

  /**
   * Get all slugs for sitemap generation
   */
  async getAllSlugs(): Promise<string[]> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${baseUrl}/v1/blogs/slugs`, {
        next: { revalidate: 86400 }, // Cache for 1 day
      });
      if (!res.ok) throw new Error("Failed to fetch slugs");
      return await res.json();
    } catch (error) {
      console.error("Error fetching slugs:", error);
      return [];
    }
  }
};
