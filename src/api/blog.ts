import { blogService } from "@/services/blog.service";
import type { BlogListItem, BlogPost } from "@/types/blog";

function toBlogListItem(
  post: Awaited<ReturnType<typeof blogService.getPublishedPosts>>[number],
): BlogListItem {
  return {
    id: String(post.id),
    title: post.title,
    slug: post.slug,
    metaDescription: post.metaDescription,
    metaKeywords: post.metaKeywords,
    coverImageUrl: post.coverImageUrl,
    author: post.authorName,
    readingTime: post.readingTime,
    publishedAt: post.publishedAt,
    featured: post.featured,
  };
}

function toBlogPost(
  post: NonNullable<Awaited<ReturnType<typeof blogService.getPostBySlug>>>,
): BlogPost {
  return {
    id: String(post.id),
    title: post.title,
    slug: post.slug,
    content: post.content,
    metaDescription: post.metaDescription,
    metaKeywords: post.metaKeywords,
    coverImageUrl: post.coverImageUrl,
    author: post.authorName,
    readingTime: post.readingTime,
    publishedAt: post.publishedAt,
    featured: post.featured,
    published: post.published,
  };
}

/** @deprecated Import from blog.service — kept for existing imports */
export async function fetchPublishedPosts(): Promise<BlogListItem[]> {
  const posts = await blogService.getPublishedPosts();
  return posts.map(toBlogListItem);
}

export async function fetchFeaturedPosts(): Promise<{
  posts: BlogListItem[];
  failed: boolean;
}> {
  const result = await blogService.getFeaturedPostsSafe();
  return {
    posts: result.data.map(toBlogListItem),
    failed: result.failed,
  };
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await blogService.getPostBySlug(slug);
  return post ? toBlogPost(post) : null;
}

export async function fetchPublishedSlugs(): Promise<string[]> {
  return blogService.getAllSlugs();
}
