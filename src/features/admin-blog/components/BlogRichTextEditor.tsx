"use client";

import { useMemo, useRef, type ReactNode } from "react";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BlogRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", active && "bg-muted")}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  );
}

/** True when TipTap HTML has no meaningful text (e.g. empty `<p></p>`). */
export function isBlogEditorContentEmpty(html: string): boolean {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return text.length === 0;
}

export function BlogRichTextEditor({ value, onChange }: BlogRichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer",
          },
        },
      }),
      Image.configure({
        allowBase64: false,
        inline: true,
      }),
      Placeholder.configure({
        placeholder: "Write your article…",
      }),
    ],
    [],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[280px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (ed.isDestroyed) return;
      onChangeRef.current(ed.getHTML());
    },
  });

  if (!editor || editor.isDestroyed) {
    return (
      <div className="min-h-[300px] animate-pulse rounded-md border bg-muted/30" />
    );
  }

  const setLink = () => {
    if (editor.isDestroyed) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImageByUrl = () => {
    if (editor.isDestroyed) return;
    const url = window.prompt(
      "Image URL (must be https:// — not uploaded to the server)",
      "https://",
    );
    if (!url?.trim()) return;
    if (url.trim().toLowerCase().startsWith("data:")) {
      window.alert("Base64 images are not allowed. Use a public image URL.");
      return;
    }
    editor.chain().focus().setImage({ src: url.trim() }).run();
  };

  const canUndo = !editor.isDestroyed && editor.can().undo();
  const canRedo = !editor.isDestroyed && editor.can().redo();

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <div className="flex flex-wrap gap-0.5 border-b bg-muted/30 p-1">
        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!canUndo}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!canRedo}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 w-px self-stretch bg-border" aria-hidden />

        <ToolbarButton
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 w-px self-stretch bg-border" aria-hidden />

        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 w-px self-stretch bg-border" aria-hidden />

        <ToolbarButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Block quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 w-px self-stretch bg-border" aria-hidden />

        <ToolbarButton
          title="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Image from URL" onClick={insertImageByUrl}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
