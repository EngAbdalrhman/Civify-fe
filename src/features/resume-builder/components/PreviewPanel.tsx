"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ResumeData } from "@/features/upload-cv/types";
import { ResumePreview } from "./ResumePreview";
import { usePreviewScale } from "../hooks/usePreviewScale";

interface PreviewPanelProps {
  resumeData: ResumeData;
  isFullScreen: boolean;
  onFullScreenToggle: () => void;
  mobileView: "editor" | "preview";
  previewContainerRef: RefObject<HTMLDivElement | null>;
}

export function PreviewPanel({
  resumeData,
  isFullScreen,
  onFullScreenToggle,
  mobileView,
  previewContainerRef,
}: PreviewPanelProps) {
  const t = useTranslations("builder");
  const { scale, scaledHeight } = usePreviewScale({
    containerRef: previewContainerRef,
  });

  return (
    <div
      ref={previewContainerRef}
      className={`flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden relative ${mobileView === "preview" ? "flex" : "hidden"} md:flex`}
    >
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="shadow-sm backdrop-blur-sm bg-background/80 hidden md:flex"
          onClick={onFullScreenToggle}
        >
          {isFullScreen ? (
            <>
              <Minimize2 className="h-4 w-4 mr-2" />{" "}
              {t("actions.exitFullscreen")}
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 mr-2" /> {t("actions.fullscreen")}
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-8 flex justify-center items-start">
        <div
          className="origin-top transition-transform duration-200 ease-in-out shrink-0"
          style={{
            transform: `scale(${scale})`,
            height: scaledHeight ? `${scaledHeight}px` : "auto",
          }}
        >
          <ResumePreview data={resumeData} />
        </div>
      </div>
    </div>
  );
}
