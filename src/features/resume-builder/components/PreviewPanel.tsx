"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ResumeData } from "@/features/upload-cv/types";
import { ResumePreview } from "./ResumePreview";
import { usePreviewScale } from "../hooks/usePreviewScale";
import { applyResumeMask } from "../utils/maskPersonalInfo";

interface PreviewPanelProps {
  resumeData: ResumeData;
  isFullScreen: boolean;
  onFullScreenToggle: () => void;
  mobileView: "editor" | "preview";
  previewContainerRef: RefObject<HTMLDivElement | null>;
  maskPII: boolean;
  onMaskPIIChange: (value: boolean) => void;
}

export function PreviewPanel({
  resumeData,
  isFullScreen,
  onFullScreenToggle,
  mobileView,
  previewContainerRef,
  maskPII,
  onMaskPIIChange,
}: PreviewPanelProps) {
  const t = useTranslations("builder");
  const tMask = useTranslations("builder.mask");
  const { scale, scaledHeight } = usePreviewScale({
    containerRef: previewContainerRef,
  });

  const previewData = applyResumeMask(resumeData, maskPII);

  return (
    <div
      ref={previewContainerRef}
      data-tour="rb-preview"
      className={`flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden relative ${mobileView === "preview" ? "flex" : "hidden"} lg:flex`}
    >
      <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center justify-end gap-2 max-w-[calc(100%-1rem)]">
        <div
          className="flex items-center gap-2 rounded-md border bg-background/90 backdrop-blur-sm shadow-sm px-2.5 py-1.5"
          data-tour="rb-mask-toggle"
        >
          <Switch
            id="preview-mask-pii"
            checked={maskPII}
            onCheckedChange={onMaskPIIChange}
            aria-label={tMask("toggleLabel")}
          />
          <Label
            htmlFor="preview-mask-pii"
            className="text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer font-medium whitespace-nowrap"
          >
            {maskPII ? (
              <EyeOff className="h-3.5 w-3.5 shrink-0 text-primary" />
            ) : (
              <Eye className="h-3.5 w-3.5 shrink-0" />
            )}
            {tMask("toggleLabel")}
          </Label>
          {maskPII && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 hidden sm:inline-flex">
              {tMask("previewActive")}
            </Badge>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="shadow-sm backdrop-blur-sm bg-background/80 hidden lg:flex"
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
          <ResumePreview data={previewData} />
        </div>
      </div>
    </div>
  );
}
