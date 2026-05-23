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
import { cn } from "@/lib/utils";

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
      className={cn(
        "flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden relative",
        mobileView === "preview" ? "flex" : "hidden",
        "lg:flex",
      )}
    >
      {/* Docked toolbar — avoids covering resume content on small screens / PWA */}
      <div
        className="shrink-0 z-20 flex items-center justify-between gap-2 border-b bg-background/95 backdrop-blur-sm px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))]"
        data-tour="rb-mask-toggle"
      >
        {/* Mobile & tablet: compact tap target */}
        <div className="flex items-center gap-2 min-w-0 lg:hidden">
          <Button
            type="button"
            variant={maskPII ? "default" : "outline"}
            size="sm"
            onClick={() => onMaskPIIChange(!maskPII)}
            aria-pressed={maskPII}
            aria-label={tMask("toggleLabel")}
            className="h-9 gap-1.5 shrink-0 px-2.5 sm:px-3"
          >
            {maskPII ? (
              <EyeOff className="h-4 w-4 shrink-0" />
            ) : (
              <Eye className="h-4 w-4 shrink-0" />
            )}
            <span className="hidden min-[400px]:inline text-xs font-medium truncate">
              {tMask("toggleShort")}
            </span>
          </Button>
          {maskPII && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 font-normal shrink-0"
            >
              {tMask("previewActive")}
            </Badge>
          )}
        </div>

        {/* Desktop: full switch + label */}
        <div className="hidden lg:flex items-center gap-2 min-w-0">
          <Switch
            id="preview-mask-pii"
            checked={maskPII}
            onCheckedChange={onMaskPIIChange}
            aria-label={tMask("toggleLabel")}
          />
          <Label
            htmlFor="preview-mask-pii"
            className="text-sm flex items-center gap-1.5 cursor-pointer font-medium whitespace-nowrap"
          >
            {maskPII ? (
              <EyeOff className="h-3.5 w-3.5 shrink-0 text-primary" />
            ) : (
              <Eye className="h-3.5 w-3.5 shrink-0" />
            )}
            {tMask("toggleLabel")}
          </Label>
          {maskPII && (
            <Badge variant="secondary" className="text-xs font-normal">
              {tMask("previewActive")}
            </Badge>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 hidden lg:flex"
          onClick={onFullScreenToggle}
        >
          {isFullScreen ? (
            <>
              <Minimize2 className="h-4 w-4 mr-2" />
              {t("actions.exitFullscreen")}
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 mr-2" />
              {t("actions.fullscreen")}
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-8 flex justify-center items-start pb-[max(5rem,env(safe-area-inset-bottom,0px)+4rem)] lg:pb-8">
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
