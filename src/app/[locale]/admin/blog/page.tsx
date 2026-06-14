"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Loader2, BookOpen, Eye, Star } from "lucide-react";
import apiClient from "@/api/client";
import { normalizeBlogHtml } from "@/lib/blog/normalizeBlogHtml";
import { BlogRichTextEditorField } from "@/features/admin-blog/components/BlogRichTextEditorField";
import { isBlogEditorContentEmpty } from "@/features/admin-blog/components/BlogRichTextEditor";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content?: string;
  metaDescription?: string;
  metaKeywords?: string;
  coverImageUrl?: string;
  author?: string;
  readingTime?: string;
  published: boolean;
  featured: boolean;
  publishedAt?: string;
  createdAt?: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  metaKeywords: string;
  coverImageUrl: string;
  author: string;
  readingTime: string;
  published: boolean;
  featured: boolean;
}

const EMPTY_FORM: BlogFormData = {
  title: "",
  slug: "",
  content: "",
  metaDescription: "",
  metaKeywords: "",
  coverImageUrl: "",
  author: "Civify Team",
  readingTime: "",
  published: false,
  featured: false,
};

// ─── Slug helper ──────────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogFormData>(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<BlogPost[]>("/v1/admin/blogs/");
      setPosts(res.data);
    } catch {
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setActiveTab("content");
    setIsDialogOpen(true);
  };

  const openEdit = async (post: BlogPost) => {
    try {
      setLoading(true);
      const res = await apiClient.get<BlogPost>(`/v1/admin/blogs/${post.id}`);
      const fullPost = res.data;
      setEditingPost(fullPost);
      setForm({
        title: fullPost.title,
        slug: fullPost.slug,
        content: normalizeBlogHtml(fullPost.content ?? ""),
        metaDescription: fullPost.metaDescription ?? "",
        metaKeywords: fullPost.metaKeywords ?? "",
        coverImageUrl: fullPost.coverImageUrl ?? "",
        author: fullPost.author ?? "Civify Team",
        readingTime: fullPost.readingTime ?? "",
        published: fullPost.published,
        featured: fullPost.featured,
      });
      setActiveTab("content");
      setIsDialogOpen(true);
    } catch (error) {
      toast.error("Failed to load post details");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      // Auto-generate slug only when creating (not editing)
      ...(editingPost ? {} : { slug: toSlug(title) }),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.slug.trim()) { toast.error("Slug is required"); return; }
    if (isBlogEditorContentEmpty(form.content)) {
      toast.error("Content is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        content: normalizeBlogHtml(form.content),
      };
      if (editingPost) {
        await apiClient.put(`/v1/admin/blogs/${editingPost.id}`, payload);
        toast.success("Post updated");
      } else {
        await apiClient.post("/v1/admin/blogs/", payload);
        toast.success("Post created");
      }
      setIsDialogOpen(false);
      loadPosts();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/v1/admin/blogs/${post.id}`);
      toast.success("Post deleted");
      loadPosts();
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      await apiClient.put(`/v1/admin/blogs/${post.id}`, { published: !post.published });
      toast.success(post.published ? "Post unpublished" : "Post published");
      loadPosts();
    } catch {
      toast.error("Failed to update post");
    }
  };

  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      await apiClient.put(`/v1/admin/blogs/${post.id}`, { featured: !post.featured });
      toast.success(post.featured ? "Removed from featured" : "Marked as featured");
      loadPosts();
    } catch {
      toast.error("Failed to update post");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7" />
            Blog Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage blog posts. Published posts appear on{" "}
            <a
              href="/en/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              /blog
            </a>{" "}
            and in the sitemap.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total posts", value: posts.length },
          { label: "Published", value: posts.filter((p) => p.published).length },
          { label: "Featured", value: posts.filter((p) => p.featured).length },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Posts table */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No blog posts yet. Create your first post.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Author</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Featured</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{post.title}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden md:table-cell max-w-[180px] truncate">
                    {post.slug}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {post.author ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      title={post.published ? "Click to unpublish" : "Click to publish"}
                    >
                      <Badge
                        variant={post.published ? "default" : "secondary"}
                        className={post.published ? "bg-green-600 cursor-pointer" : "cursor-pointer"}
                      >
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleFeatured(post)}
                      title={post.featured ? "Remove from featured" : "Mark as featured"}
                      className={post.featured ? "text-yellow-500" : "text-muted-foreground/30 hover:text-yellow-400"}
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {post.published && (
                        <Button variant="ghost" size="icon" asChild title="View live">
                          <a href={`/en/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(post)} title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "New Blog Post"}</DialogTitle>
          </DialogHeader>

          {/* Tab switcher */}
          <div className="flex gap-1 border-b mb-4">
            {(["content", "seo"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "seo" ? "SEO & Meta" : "Content"}
              </button>
            ))}
          </div>

          {activeTab === "content" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="How to Write an ATS-Friendly Resume in 2026"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="ats-friendly-resume-2026"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  URL: /en/blog/<span className="font-mono">{form.slug || "your-slug"}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="Civify Team"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="readingTime">Reading Time</Label>
                  <Input
                    id="readingTime"
                    value={form.readingTime}
                    onChange={(e) => setForm({ ...form, readingTime: e.target.value })}
                    placeholder="7 min"
                  />
                </div>
              </div>

              <BlogRichTextEditorField
                editorInstanceKey={String(editingPost?.id ?? "new")}
                value={form.content}
                onChange={(content) => setForm((prev) => ({ ...prev, content }))}
              />

              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  value={form.coverImageUrl}
                  onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="published"
                    checked={form.published}
                    onCheckedChange={(v) => setForm({ ...form, published: v })}
                  />
                  <Label htmlFor="published" className="cursor-pointer">Published</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="featured"
                    checked={form.featured}
                    onCheckedChange={(v) => setForm({ ...form, featured: v })}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Featured <span className="text-muted-foreground text-xs">(shown on homepage)</span>
                  </Label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-800 dark:text-blue-300">
                These fields control how the post appears in Google search results and social media previews.
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  placeholder="150–160 character description for Google search results..."
                  rows={3}
                />
                <p className={`text-xs ${form.metaDescription.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                  {form.metaDescription.length}/160 characters
                  {form.metaDescription.length > 160 && " — too long, Google will truncate"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  value={form.metaKeywords}
                  onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
                  placeholder="ats resume, applicant tracking system, cv optimization"
                />
                <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
              </div>

              {/* Google preview */}
              {(form.title || form.metaDescription) && (
                <div className="space-y-2">
                  <Label>Google Preview</Label>
                  <div className="rounded-md border bg-white dark:bg-gray-950 p-4 space-y-1">
                    <div className="text-xs text-green-700 dark:text-green-500">
                      civify.cv › en › blog › {form.slug || "your-slug"}
                    </div>
                    <div className="text-blue-700 dark:text-blue-400 text-base font-medium line-clamp-1">
                      {form.title || "Post title"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {form.metaDescription || "Meta description will appear here..."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPost ? "Save Changes" : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
