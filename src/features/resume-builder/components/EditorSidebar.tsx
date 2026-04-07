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
  Linkedin,
  BriefcaseBusiness,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ResumeData } from "@/features/upload-cv/types";
import { EditorPanel } from "./EditorPanel";
import { DesignPanel } from "./DesignPanel";
import { ExportPanel } from "./ExportPanel";
import { TargetJobPanel } from "./TargetJobPanel";
import { BuilderSaveStatus } from "./BuilderSaveStatus";
import { FILE_ACCEPT } from "../utils/constants";
import {
  BuilderSaveStatus as SaveStatus,
  TargetJobResultState,
  TargetJobState,
  TailoringOptions,
} from "@/features/resume-builder/types";

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
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  onSaveClick: () => void;
  onResetClick: () => void;

  // Upload handlers
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadClick: () => void;
  onLinkedInImportClick: () => void;

  // ATS Score
  isCalculatingScore: boolean;
  onCalculateScore: () => void;

  // Target job
  targetJob: TargetJobState;
  tailoringOptions: TailoringOptions;
  targetJobResult: TargetJobResultState;
  targetJobError: string;
  isScrapingJobUrl: boolean;
  isTailoring: boolean;
  isSavingTailoredResume: boolean;
  onTargetJobChange: (updates: Partial<TargetJobState>) => void;
  onTailoringOptionsChange: (updates: Partial<TailoringOptions>) => void;
  onScrapeJobUrl: () => Promise<void>;
  onGenerateTailoredResume: () => void;
  onApplyTailoredResume: () => void;
  onSaveTailoredDuplicate: () => void;
  onCopyCoverLetter: () => void;
  onDownloadCoverLetter: () => void;

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
  saveStatus,
  lastSavedAt,
  onSaveClick,
  onResetClick,
  isUploading,
  fileInputRef,
  onFileUpload,
  onUploadClick,
  onLinkedInImportClick,
  isCalculatingScore,
  onCalculateScore,
  targetJob,
  tailoringOptions,
  targetJobResult,
  targetJobError,
  isScrapingJobUrl,
  isTailoring,
  isSavingTailoredResume,
  onTargetJobChange,
  onTailoringOptionsChange,
  onScrapeJobUrl,
  onGenerateTailoredResume,
  onApplyTailoredResume,
  onSaveTailoredDuplicate,
  onCopyCoverLetter,
  onDownloadCoverLetter,
  isGuest = false,
  onAuthGate,
}: EditorSidebarProps) {
  const t = useTranslations("builder");
  const tr = (key: string, fallback: string) =>
    t.has(key as never) ? t(key as never) : fallback;

  return (
    <div
      data-tour="rb-main"
      className={`w-full lg:w-[450px] shrink-0 border-r bg-card flex flex-col h-full z-10 shadow-xl ${mobileView === "editor" ? "flex" : "hidden"} lg:flex`}
    >
      {/* Header */}
      <div data-tour="rb-header" className="space-y-3 border-b bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-bold text-xl flex items-center gap-2">
              <span className="text-primary">Civify</span>{" "}
              {t("title").replace("Civify ", "")}
            </h1>
            <BuilderSaveStatus status={saveStatus} lastSavedAt={lastSavedAt} />
          </div>
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
              title={tr("actions.upload", "Upload Resume")}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onLinkedInImportClick}
              className="gap-2"
              title={tr("actions.linkedinImport", "Import LinkedIn")}
            >
              <Linkedin className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onResetClick}
              title={tr("actions.reset", "Reset to Original")}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
            variant="outline"
            size="sm"
            onClick={onCalculateScore}
            disabled={isCalculatingScore}
            className="gap-2"
              title={tr("actions.atsScore", "ATS Score")}
            >
              {isCalculatingScore ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Target className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onSaveClick}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving
                ? tr("actions.saving", "Saving...")
                : tr("actions.save", "Save")}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={onActiveTabChange}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="px-4 pt-4">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger data-tour="rb-tab-content" value="content" className="flex gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.content")}</span>
            </TabsTrigger>
            <TabsTrigger value="target" className="flex gap-2">
              <BriefcaseBusiness className="h-4 w-4" />
              <span className="hidden sm:inline">{tr("tabs.target", "Target Job")}</span>
            </TabsTrigger>
            <TabsTrigger data-tour="rb-tab-design" value="design" className="flex gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.design")}</span>
            </TabsTrigger>
            <TabsTrigger data-tour="rb-tab-export" value="export" className="flex gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.export")}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 pb-24 md:pb-20">
            <TabsContent value="content" className="mt-0 space-y-6">
              <div className="rounded-2xl border border-dashed bg-muted/20 p-4">
                <div className="mb-3">
                  <h3 className="font-semibold">
                    {tr("importWorkspace.title", "Bring in your source material")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tr(
                      "importWorkspace.subtitle",
                      "Start from an existing resume or paste LinkedIn profile text for a guided merge.",
                    )}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={isGuest && onAuthGate ? onAuthGate : onUploadClick}
                    disabled={isUploading}
                    className="justify-start gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {tr("actions.upload", "Upload Resume")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onLinkedInImportClick}
                    className="justify-start gap-2"
                  >
                    <Linkedin className="h-4 w-4" />
                    {tr("actions.linkedinImport", "Import LinkedIn")}
                  </Button>
                </div>
              </div>
              <EditorPanel data={resumeData} onChange={onResumeDataChange} />
            </TabsContent>

            <TabsContent value="target" className="mt-0">
              <TargetJobPanel
                targetJob={targetJob}
                options={tailoringOptions}
                result={targetJobResult}
                jobDescriptionError={targetJobError}
                isScraping={isScrapingJobUrl}
                isTailoring={isTailoring}
                isSavingTailoredResume={isSavingTailoredResume}
                onTargetJobChange={onTargetJobChange}
                onOptionsChange={onTailoringOptionsChange}
                onScrapeJobUrl={onScrapeJobUrl}
                onGenerate={onGenerateTailoredResume}
                onOpenAtsScore={onCalculateScore}
                onApplyTailored={onApplyTailoredResume}
                onSaveTailoredDuplicate={onSaveTailoredDuplicate}
                onCopyCoverLetter={onCopyCoverLetter}
                onDownloadCoverLetter={onDownloadCoverLetter}
              />
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
