"use client";

import { useState, useEffect, useRef } from "react";
import {
  ResumeData,
  emptyResumeData,
  AtsScore,
} from "@/features/upload-cv/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Palette,
  Download,
  Save,
  RotateCcw,
  FileText,
  Maximize2,
  Minimize2,
  Upload,
  Target,
  Loader2,
  Eye,
  PenSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ResumeService } from "@/services/resume.service";
import apiClient from "@/api/client";
import { CvParseResponse } from "@/features/upload-cv/types";
import { useTranslations } from "next-intl";

import { ResumePreview } from "./ResumePreview";
import { EditorPanel } from "./EditorPanel";
import { DesignPanel } from "./DesignPanel";
import { ExportPanel } from "./ExportPanel";
import { AtsScoreDialog } from "./AtsScoreDialog";

const STORAGE_KEY = "civify_guest_resume";

interface ResumeBuilderProps {
  initialData: ResumeData;
  resumeId?: string | null;
  isGuest: boolean;
}

export function ResumeBuilder({
  initialData,
  resumeId,
  isGuest,
}: ResumeBuilderProps) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialData);
  const [activeTab, setActiveTab] = useState("content");
  const [isSaving, setIsSaving] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [resumeTitle, setResumeTitle] = useState(
    initialData.personalInfo?.fullName
      ? `${initialData.personalInfo.fullName}'s Resume`
      : "Untitled Resume",
  );
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(
    resumeId || null,
  );

  const router = useRouter();
  const originalDataRef = useRef<ResumeData>(initialData);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // ATS Score state
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);
  
  const t = useTranslations('builder');
  const tCommon = useTranslations('common');

  // ATS Score state
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);

  // Mobile view state - 'editor' or 'preview'
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");

  const t = useTranslations("builder");
  const tCommon = useTranslations("common");

  // Update ref when initialData changes (e.g., loading a different resume)
  useEffect(() => {
    originalDataRef.current = initialData;
    setResumeData(initialData);
  }, [initialData]);

  // ... (useEffect for guest persistence and fullscreen)

  const handleSaveClick = () => {
    if (isGuest) {
      toast.info(t("saveDialog.description"), {
        action: {
          label: tCommon("login"),
          onClick: () => router.push("/login?callbackUrl=/app/resume-builder"),
        },
      });
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = async () => {
    if (!resumeTitle.trim()) {
      toast.error(t("toasts.enterTitle"));
      return;
    }

    setIsSaving(true);
    setShowSaveDialog(false);

    try {
      if (currentResumeId) {
        await ResumeService.update(currentResumeId, resumeTitle, resumeData);
      } else {
        const created = await ResumeService.create(resumeTitle, resumeData);
        setCurrentResumeId(created.id);
        // Clear guest cache after successful save
        localStorage.removeItem(STORAGE_KEY);
      }
      toast.success(t("toasts.saveSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setResumeData(originalDataRef.current);
    if (isGuest) {
      localStorage.removeItem(STORAGE_KEY);
    }
    toast.info(t("toasts.resetInfo"));
  };

  const handleFullScreenToggle = async () => {
    try {
      if (!document.fullscreenElement) {
        await previewContainerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
      toast.error(t("toasts.fullscreenError"));
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("toasts.uploadError"));
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<CvParseResponse>(
        "/v1/cvs/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000, // 2 min timeout for file processing
        },
      );

      const data = response.data;

      if (data?.resumeData) {
        setResumeData(data.resumeData);
        originalDataRef.current = data.resumeData;
        toast.success(t("toasts.parseSuccess"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("toasts.parseError"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCalculateScore = async () => {
    if (isGuest) {
      toast.info("Please login to use ATS Score analysis", {
        action: {
          label: tCommon("login"),
          onClick: () => router.push("/login?callbackUrl=/app/resume-builder"),
        },
      });
      return;
    }

    setShowScoreDialog(true);
    setIsCalculatingScore(true);
    setAtsScore(null);

    try {
      const score = await ResumeService.calculateScore(resumeData);
      setAtsScore(score);
    } catch (error) {
      console.error("Score calculation error:", error);
      toast.error("Failed to calculate ATS score");
      setShowScoreDialog(false);
    } finally {
      setIsCalculatingScore(false);
    }
  };
  return (
    <>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background relative">
        {/* Mobile View Toggle Button */}
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <Button
            onClick={() =>
              setMobileView(mobileView === "editor" ? "preview" : "editor")
            }
            size="lg"
            className="rounded-full shadow-lg h-14 w-14"
          >
            {mobileView === "editor" ? (
              <Eye className="h-6 w-6" />
            ) : (
              <PenSquare className="h-6 w-6" />
            )}
          </Button>
        </div>
        {/* Left Sidebar - Editor Configuration */}
        <div
          className={`w-full md:w-[450px] shrink-0 border-r bg-card flex flex-col h-full z-10 shadow-xl ${mobileView === "editor" ? "flex" : "hidden"} md:flex`}
        >
          <div className="p-4 border-b flex items-center justify-between bg-card">
            <h1 className="font-bold text-xl flex items-center gap-2">
              <span className="text-primary">Civify</span>{" "}
              {t("title").replace("Civify ", "")}
            </h1>
            <div className="flex gap-2">
              {/* Hidden file input for upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isGuest) {
                    toast.info(t("toasts.guestUpload"), {
                      action: {
                        label: t("toasts.loginAction"),
                        onClick: () =>
                          router.push("/login?callbackUrl=/app/resume-builder"),
                      },
                    });
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                className="gap-2"
                title={t("actions.upload")}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                title={t("actions.reset")}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCalculateScore}
                disabled={isCalculatingScore}
                className="gap-2"
                title="ATS Score"
              >
                <Target className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveClick}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? t("actions.saving") : t("actions.save")}
              </Button>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="content" className="flex gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("tabs.content")}</span>
                </TabsTrigger>
                <TabsTrigger value="design" className="flex gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("tabs.design")}</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="flex gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("tabs.export")}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4 pb-24 md:pb-20">
                <TabsContent value="content" className="mt-0 space-y-6">
                  <EditorPanel data={resumeData} onChange={setResumeData} />
                </TabsContent>

                <TabsContent value="design" className="mt-0">
                  <DesignPanel data={resumeData} onChange={setResumeData} />
                </TabsContent>

                <TabsContent value="export" className="mt-0">
                  <ExportPanel data={resumeData} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Right Area - Live Preview */}
        <div
          ref={previewContainerRef}
          className={`flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden relative ${mobileView === "preview" ? "flex" : "hidden"} md:flex`}
        >
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="shadow-sm backdrop-blur-sm bg-background/80 hidden md:flex"
              onClick={handleFullScreenToggle}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="h-4 w-4 mr-2" />{" "}
                  {t("actions.exitFullscreen")}
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 mr-2" />{" "}
                  {t("actions.fullscreen")}
                </>
              )}
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-8 flex justify-center items-start min-h-0">
            <div
              className="origin-top transition-transform duration-200 ease-in-out"
              style={{
                // 210mm is ~794px, scale to fit screen width with padding
                transform: `scale(clamp(0.35, calc((100vw - 32px) / 794), 1))`,
              }}
            >
              <ResumePreview data={resumeData} />
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("saveDialog.title")}</DialogTitle>
            <DialogDescription>{t("saveDialog.description")}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="resume-title">{t("saveDialog.label")}</Label>
            <Input
              id="resume-title"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              placeholder={t("saveDialog.placeholder")}
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              {t("saveDialog.cancel")}
            </Button>
            <Button onClick={handleSaveConfirm} disabled={!resumeTitle.trim()}>
              {t("saveDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ATS Score Dialog */}
      <AtsScoreDialog
        open={showScoreDialog}
        onOpenChange={setShowScoreDialog}
        score={atsScore}
        isLoading={isCalculatingScore}
      />
    </>
  );
}
