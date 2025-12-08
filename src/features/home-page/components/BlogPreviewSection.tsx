"use client";

import { ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { blogPosts } from "../data";

export function BlogPreviewSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50/30 to-background py-20 dark:from-gray-900 dark:to-background md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Career Resources
          </h2>
          <p className="text-lg text-muted-foreground">
            Expert tips and guides to boost your job search
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {blogPosts.map((post) => (
            <Card
              key={post.id}
              className="group overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/10"
            >
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-purple-900/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="text-4xl font-bold text-gray-300 dark:text-gray-700">
                        📝
                      </div>
                    </div>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Read Time */}
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Read More */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    Read more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/blog">
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
