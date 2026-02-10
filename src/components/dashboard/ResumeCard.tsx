"use client";

import { FileText, Pencil, Trash2, ArrowDownToLine } from "lucide-react";
import Link from "next/link";
import { ResumeSummary } from "@/services/resume.service";
import { useRouter } from "next/navigation";

interface ResumeCardProps {
  resume: ResumeSummary;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDownload: (id: string, e: React.MouseEvent) => void;
}

export function ResumeCard({ resume, onDelete, onDownload }: ResumeCardProps) {
  const router = useRouter();

  const formattedDate = new Date(resume.updatedAt).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric" },
  );

  return (
    <div className="flex flex-col rounded-lg border bg-card overflow-hidden transition-all duration-200 hover:shadow-md hover:border-foreground/15">
      {/* Clickable preview — navigates to editor */}
      <Link
        href={`/app/resume-builder?id=${resume.id}`}
        className="block flex-1"
      >
        <div className="h-[110px] bg-muted/40 flex items-center justify-center">
          <FileText className="h-12 w-12 text-muted-foreground/15" />
        </div>

        {/* Title & date */}
        <div className="px-4 py-2.5">
          <h3 className="text-sm font-medium truncate" title={resume.title}>
            {resume.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formattedDate}
          </p>
        </div>
      </Link>

      {/* Action bar — always visible */}
      <div className="flex items-center border-t">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/app/resume-builder?id=${resume.id}`);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Edit resume"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </button>

        <div className="w-px h-4 bg-border" />

        <button
          onClick={(e) => onDownload(resume.id, e)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Export resume"
        >
          <ArrowDownToLine className="h-3.5 w-3.5" />
          <span>Export</span>
        </button>

        <div className="w-px h-4 bg-border" />

        <button
          onClick={(e) => onDelete(resume.id, e)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          aria-label="Delete resume"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
