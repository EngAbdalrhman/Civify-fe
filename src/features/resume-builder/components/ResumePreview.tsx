"use client";

import { ResumeData } from "@/features/upload-cv/types";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { ExecutiveTemplate } from "./templates/ExecutiveTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { AtsTemplate } from "./templates/AtsTemplate";

interface ResumePreviewProps {
  data: ResumeData;
  /** Omit fixed id when multiple previews render on one page (e.g. landing carousel). */
  omitContentId?: boolean;
}

export function ResumePreview({ data, omitContentId }: ResumePreviewProps) {
  const { metadata } = data;
  const templateId = metadata?.templateId || "modern";
  const bodyFont = metadata?.bodyFontFamily || metadata?.fontFamily || "Inter";
  const headingFont =
    metadata?.headingFontFamily || metadata?.fontFamily || "Inter";
  const primaryColor = metadata?.primaryColor || "#000000";

  // Map template ID to component
  const renderTemplate = () => {
    switch (templateId) {
      case "modern":
        return <ModernTemplate data={data} color={primaryColor} />;
      case "classic":
        return <ClassicTemplate data={data} color={primaryColor} />;
      case "creative":
        return <CreativeTemplate data={data} color={primaryColor} />;
      case "executive":
        return <ExecutiveTemplate data={data} color={primaryColor} />;
      case "minimal":
        return <MinimalTemplate data={data} color={primaryColor} />;
      case "ats":
        return <AtsTemplate data={data} color={primaryColor} />;
      default:
        return <ModernTemplate data={data} color={primaryColor} />;
    }
  };

  return (
    <>
    {!omitContentId && (
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap"
      />
    )}
    <div
      className="bg-white shadow-2xl p-0 w-[210mm] min-h-[297mm] mx-auto origin-top transition-all flex flex-col"
      style={
        {
          fontFamily: bodyFont,
          "--heading-font": `"${headingFont}", sans-serif`,
        } as React.CSSProperties
      }
      {...(!omitContentId ? { id: "resume-preview-content" } : {})}
    >
      {renderTemplate()}
    </div>
    </>
  );
}
