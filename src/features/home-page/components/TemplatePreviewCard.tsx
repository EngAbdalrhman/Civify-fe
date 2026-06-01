"use client";

import { useEffect, useRef, useState } from "react";
import { ResumePreview } from "@/features/resume-builder/components/ResumePreview";
import {
  getDemoResumeForTemplate,
  type LandingTemplateId,
} from "@/features/home-page/data/demoResumeByTemplate";
import { cn } from "@/lib/utils";

const RESUME_WIDTH_PX = 794;
const MIN_SCALE = 0.32;
const MAX_SCALE = 0.48;

interface TemplatePreviewCardProps {
  templateId: LandingTemplateId;
  className?: string;
}

export function TemplatePreviewCard({
  templateId,
  className,
}: TemplatePreviewCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.34);
  const data = getDemoResumeForTemplate(templateId);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateScale = () => {
      const padding = 20;
      const available = node.clientWidth - padding;
      const next = Math.min(
        Math.max(available / RESUME_WIDTH_PX, MIN_SCALE),
        MAX_SCALE,
      );
      setScale(next);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full min-h-[260px] w-full overflow-hidden",
        "bg-gradient-to-b from-slate-200/80 via-slate-100 to-slate-200/60",
        "dark:from-slate-800 dark:via-slate-900 dark:to-slate-800",
        className,
      )}
      aria-hidden
    >
      {/* Subtle desk surface */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.35) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />

      <div
        className="absolute left-1/2 top-1/2 z-[1] origin-top rounded-sm shadow-2xl ring-1 ring-black/10 dark:ring-white/10"
        style={{
          width: `${RESUME_WIDTH_PX}px`,
          transform: `translate(-50%, -8%) scale(${scale})`,
        }}
      >
        <ResumePreview data={data} omitContentId />
      </div>

      {/* Fade so clipped content reads as a preview, not a bug */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-20 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent dark:from-slate-900 dark:via-slate-900/90" />
    </div>
  );
}
