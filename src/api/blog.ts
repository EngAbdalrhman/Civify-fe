import type { BlogListItem, BlogPost } from "@/types/blog";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://civify.cv/apis";

/**
 * Server-side fetch helpers for blog — used in SSR page components.
 * These bypass the client-side apiClient (which requires window) and
 * call the backend directly with Next.js fetch caching.
 */

export async function fetchPublishedPosts(): Promise<BlogListItem[]> {
  try {
    const res = await fetch(`${API_BASE}/v1/blogs`, {
      next: { revalidate: 300 }, // revalidate every 5 minutes
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchFeaturedPosts(): Promise<BlogListItem[]> {
  try {
    const res = await fetch(`${API_BASE}/v1/blogs/featured`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/blogs/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchPublishedSlugs(): Promise<string[]> {
  const posts = await fetchPublishedPosts();
  return posts.map((p) => p.slug).filter(Boolean);
}
