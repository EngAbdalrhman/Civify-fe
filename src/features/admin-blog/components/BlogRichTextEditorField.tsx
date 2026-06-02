"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const BlogRichTextEditor = dynamic(
  () =>
    import("@/features/admin-blog/components/BlogRichTextEditor").then(
      (mod) => mod.BlogRichTextEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[300px] items-center justify-center rounded-md border bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

export interface BlogRichTextEditorFieldProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  editorKey: string;
}

export function BlogRichTextEditorField({
  label = "Content",
  value,
  onChange,
  editorKey,
}: BlogRichTextEditorFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label} *</Label>
      <BlogRichTextEditor
        editorKey={editorKey}
        value={value}
        onChange={onChange}
      />
      <p className="text-xs text-muted-foreground">
        Headings, lists, links, and quotes. Hero image uses the cover URL field
        above. Inline images must be a public https URL — they are not stored as
        base64 in the database.
      </p>
    </div>
  );
}
