export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  metaDescription?: string;
  metaKeywords?: string;
  coverImage?: string;
  author?: string;
  readingTime?: string;
  publishedAt?: string;
  featured?: boolean;
  published?: boolean;
}

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  metaDescription?: string;
  metaKeywords?: string;
  coverImage?: string;
  author?: string;
  readingTime?: string;
  publishedAt?: string;
  featured?: boolean;
}
