export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  metaKeywords?: string;
  coverImageUrl?: string;
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
  metaDescription?: string;
  metaKeywords?: string;
  coverImageUrl?: string;
  author?: string;
  readingTime?: string;
  publishedAt?: string;
  featured?: boolean;
}
