"use client";

import { ResumePreview } from "@/features/resume-builder/components/ResumePreview";
import {
  getDemoResumeForTemplate,
  type LandingTemplateId,
} from "@/features/home-page/data/demoResumeByTemplate";

const PREVIEW_SCALE = 0.26;

interface TemplatePreviewCardProps {
  templateId: LandingTemplateId;
}

export function TemplatePreviewCard({ templateId }: TemplatePreviewCardProps) {
  const data = getDemoResumeForTemplate(templateId);

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-2 origin-top"
        style={{
          transform: `translateX(-50%) scale(${PREVIEW_SCALE})`,
          width: "210mm",
        }}
      >
        <ResumePreview data={data} omitContentId />
      </div>
    </div>
  );
}
