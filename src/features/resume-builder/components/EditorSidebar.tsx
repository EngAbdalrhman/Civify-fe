"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Download,
  Save,
  RotateCcw,
  FileText,
  Upload,
  Target,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ResumeData } from "@/features/upload-cv/types";
import { EditorPanel } from "./EditorPanel";
import { DesignPanel } from "./DesignPanel";
import { ExportPanel } from "./ExportPanel";
import { FILE_ACCEPT } from "../utils/constants";
import { BuilderSaveStatus } from "./BuilderSaveStatus";
import type { BuilderSaveStatus as SaveStatusType } from "../types";

interface EditorSidebarProps {
  // Resume data
  resumeData: ResumeData;
  onResumeDataChange: (data: ResumeData) => void;

  // Tab state
  activeTab: string;
  onActiveTabChange: (tab: string) => void;

  // Mobile view
  mobileView: "editor" | "preview";

  // Save handlers
  isSaving: boolean;
  onSaveClick: () => void;
  onResetClick: () => void;

  // Save status (autosave)
  saveStatus: SaveStatusType;
  lastSavedAt: string | null;

  // Upload handlers
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadClick: () => void;

  // ATS Score
  isCalculatingScore: boolean;
  onCalculateScore: () => void;

  // Guest mode
  isGuest?: boolean;
  onAuthGate?: () => void;
}

export function EditorSidebar({
  resumeData,
  onResumeDataChange,
  activeTab,
  onActiveTabChange,
  mobileView,
  isSaving,
  onSaveClick,
  onResetClick,
  saveStatus,
  lastSavedAt,
  isUploading,
  fileInputRef,
  onFileUpload,
  onUploadClick,
  isCalculatingScore,
  onCalculateScore,
  isGuest = false,
  onAuthGate,
}: EditorSidebarProps) {
  const t = useTranslations("builder");

  return (
    <div
      data-tour="rb-main"
      className={`w-full lg:w-[450px] shrink-0 border-r bg-card flex flex-col h-full z-10 shadow-xl ${mobileView === "editor" ? "flex" : "hidden"} lg:flex`}
    >
      {/* Header */}
      <div
        data-tour="rb-header"
        className="p-4 border-b flex items-center justify-between bg-card"
      >
        <BuilderSaveStatus status={saveStatus} lastSavedAt={lastSavedAt} />
        <div className="flex gap-2">
          {/* Hidden file input for upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileUpload}
            accept={FILE_ACCEPT}
            className="hidden"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={isGuest && onAuthGate ? onAuthGate : onUploadClick}
            disabled={isUploading}
            className="gap-2"
            title={t("actions.upload")}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onResetClick}
            title={t("actions.reset")}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          {/* <Button
            variant="outline"
            size="sm"
            onClick={onCalculateScore}
            disabled={isCalculatingScore}
            className="gap-2"
            title="ATS Score"
          >
            <Target className="h-4 w-4" />
          </Button> */}
          <Button
            variant="default"
            size="sm"
            onClick={onSaveClick}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? t("actions.saving") : t("actions.save")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={onActiveTabChange}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="px-4 pt-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger
              data-tour="rb-tab-content"
              value="content"
              className="flex gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.content")}</span>
            </TabsTrigger>
            <TabsTrigger
              data-tour="rb-tab-design"
              value="design"
              className="flex gap-2"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.design")}</span>
            </TabsTrigger>
            <TabsTrigger
              data-tour="rb-tab-export"
              value="export"
              className="flex gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.export")}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 pb-24 md:pb-20">
            <TabsContent value="content" className="mt-0 space-y-6">
              <EditorPanel data={resumeData} onChange={onResumeDataChange} />
            </TabsContent>

            <TabsContent value="design" className="mt-0">
              <DesignPanel data={resumeData} onChange={onResumeDataChange} />
            </TabsContent>

            <TabsContent value="export" className="mt-0">
              <ExportPanel
                data={resumeData}
                isGuest={isGuest}
                onAuthGate={onAuthGate}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
