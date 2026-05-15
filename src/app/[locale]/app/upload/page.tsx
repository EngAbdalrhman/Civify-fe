"use client";

import {useCallback, useMemo, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    CreditCard,
    Download,
    Edit2,
    Eye,
    EyeOff,
    FileEdit,
    FileText,
    FolderOpen,
    Github,
    Globe,
    HelpCircle,
    Linkedin,
    Loader2,
    Mail,
    Map,
    MapPin,
    MessageSquare,
    Phone,
    Plus,
    RefreshCw,
    Save,
    Sparkles,
    Trash2,
    UploadCloud,
    X,
    Zap,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import {Switch} from "@/components/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {toast} from "sonner";
import Link from "next/link";
import {useTailorCv, useUploadCv} from "@/features/upload-cv/hooks";
import {
    type CvTailorResponse,
    emptyResumeData,
    type ResumeData,
    type ResumeSection,
} from "@/features/upload-cv/types";
import {exportToDocx, exportToPdfPuppeteer, type TemplateType,} from "@/features/upload-cv/utils/exportCv";
import {useRouter} from "next/navigation";
import {ResumeService, ResumeSummary} from "@/services/resume.service";
import {JobApplicationService} from "@/services/job-application.service";
import {getAccessToken} from "@/utils/cookies";
import {AuthGateDialog} from "@/features/resume-builder/components/AuthGateDialog";
import {ResumePreview} from "@/features/resume-builder/components/ResumePreview";
// import { AdBanner } from "@/components/ads/AdBanner";
import {
    getUploadStep2TourSteps,
    getUploadStep3TourSteps,
    getUploadStep4TourSteps,
    getUploadTourSteps,
    useTourAutoStart,
    useTour,
} from "@/features/onboarding";
import {ensureUniqueSectionItemIds} from "@/features/resume-builder/utils/normalizeResumeIds";
import {usePreviewScale} from "@/features/resume-builder/hooks/usePreviewScale";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function UploadPage() {
  const t = useTranslations("upload");
  const tTour = useTranslations("tour");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvPreviewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [tailorResponse, setTailorResponse] = useState<CvTailorResponse | null>(
    null,
  );
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [generateCoverLetter, setGenerateCoverLetter] = useState(false);
  const [includeInterviewQuestions, setIncludeInterviewQuestions] =
    useState(false);
  const [includeRoadmap, setIncludeRoadmap] = useState(false);
  const [maskPII, setMaskPII] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [showTokenLimitModal, setShowTokenLimitModal] = useState(false);
  const [jobDescriptionError, setJobDescriptionError] = useState("");
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jdUrl, setJdUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  // Resume selector state
  const [showResumeSelector, setShowResumeSelector] = useState(false);
  const [storedResumes, setStoredResumes] = useState<ResumeSummary[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);

  // API Hooks
  const { mutate: uploadCv, isPending: isUploading } = useUploadCv();
  const { mutate: tailorCv, isPending: isTailoring } = useTailorCv();

  // Tour
  const { startTour } = useTour();

  // Responsive preview scaling for Step 4 (matches Resume Builder)
  const { scale: previewScale, scaledHeight: previewScaledHeight } = usePreviewScale({
    containerRef: previewContainerRef,
    enabled: currentStep === 4,
  });

  useTourAutoStart("upload", getUploadTourSteps(tTour), { enabled: currentStep === 1 });
  useTourAutoStart("upload-step2", getUploadStep2TourSteps(tTour), {
    enabled: currentStep === 2 && !!resumeData,
  });
  useTourAutoStart("upload-step3", getUploadStep3TourSteps(tTour), {
    enabled: currentStep === 3,
  });
  useTourAutoStart(
    "upload-step4",
    getUploadStep4TourSteps(tTour, {
      hasCoverLetter: !!tailorResponse?.coverLetter,
      hasInterviewPrep: !!tailorResponse?.interviewPrep?.questions?.length,
      hasRoadmap: !!tailorResponse?.roadmap?.steps?.length,
    }),
    { enabled: currentStep === 4 && !!tailorResponse },
  );

  const handleStartTour = useCallback(() => {
    if (currentStep === 1) startTour("upload", getUploadTourSteps(tTour));
    else if (currentStep === 2) startTour("upload-step2", getUploadStep2TourSteps(tTour));
    else if (currentStep === 3) startTour("upload-step3", getUploadStep3TourSteps(tTour));
    else if (currentStep === 4) startTour("upload-step4", getUploadStep4TourSteps(tTour, {
      hasCoverLetter: !!tailorResponse?.coverLetter,
      hasInterviewPrep: !!tailorResponse?.interviewPrep?.questions?.length,
      hasRoadmap: !!tailorResponse?.roadmap?.steps?.length,
    }));
  }, [currentStep, startTour, tTour, tailorResponse]);

  // Handlers
  const handleUploadClick = useCallback(() => {
    const token = getAccessToken();
    if (!token) {
      setShowAuthGate(true);
      return;
    }
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(t("errors.invalidFileType"));
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(t("errors.FILE_TOO_LARGE"));
        return;
      }

      uploadCv(file, {
        onSuccess: (data) => {
          if (data.resumeData) {
            setResumeData(data.resumeData);
            setCurrentStep(2);
          } else {
            toast.error(t("errors.parseFailed"));
          }
        },
        onError: (error: any) => {
          if (
            error?.errorCode === "TOKEN_LIMIT_EXCEEDED" ||
            error?.message === "TOKEN_LIMIT_EXCEEDED"
          ) {
            setShowTokenLimitModal(true);
          }
        },
      });
    },
    [uploadCv, router, t],
  );

  // Drag and drop handlers
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    [],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    },
    [],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      const token = getAccessToken();
      if (!token) {
        setShowAuthGate(true);
        return;
      }

      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(t("errors.invalidFileType"));
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(t("errors.FILE_TOO_LARGE"));
        return;
      }

      uploadCv(file, {
        onSuccess: (data) => {
          if (data.resumeData) {
            setResumeData(data.resumeData);
            setCurrentStep(2);
          } else {
            toast.error(t("errors.parseFailed"));
          }
        },
        onError: (error: any) => {
          if (
            error?.errorCode === "TOKEN_LIMIT_EXCEEDED" ||
            error?.message === "TOKEN_LIMIT_EXCEEDED"
          ) {
            setShowTokenLimitModal(true);
          }
        },
      });
    },
    [uploadCv, router, t],
  );

  const handleManualEntry = useCallback(() => {
    const token = getAccessToken();
    if (!token) {
      setShowAuthGate(true);
      return;
    }

    setResumeData(emptyResumeData);
    setCurrentStep(2);
  }, []);

  const handleOpenResumeSelector = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setShowAuthGate(true);
      return;
    }

    setShowResumeSelector(true);
    setIsLoadingResumes(true);
    try {
      const resumes = await ResumeService.getAll();
      setStoredResumes(resumes);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      toast.error(t("selectResume.loadError") || "Failed to load resumes");
    } finally {
      setIsLoadingResumes(false);
    }
  }, [router, t]);

  const handleSelectStoredResume = useCallback(
    async (resume: ResumeSummary) => {
      setShowResumeSelector(false);
      try {
        const fullResume = await ResumeService.getById(resume.id);
        if (fullResume.data) {
          setResumeData(fullResume.data);
          setCurrentStep(2);
        } else {
          toast.error(t("selectResume.loadError") || "Resume data not found");
        }
      } catch (error) {
        console.error("Failed to load resume:", error);
        toast.error(t("selectResume.loadError") || "Failed to load resume");
      }
    },
    [t],
  );

  // Download handlers
  const handleDownloadPdf = async () => {
    if (!tailorResponse?.tailoredCv) return;

    setIsExportingPdf(true);
    try {
      const filename = `${tailorResponse.tailoredCv.personalInfo.fullName || "cv"}_tailored`;

      const template = (tailorResponse.tailoredCv.metadata?.templateId ||
        "modern") as TemplateType;
      const color = tailorResponse.tailoredCv.metadata?.primaryColor || "#000000";

      await exportToPdfPuppeteer(tailorResponse.tailoredCv, {
        filename,
        template,
        color,
      });
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error(t("errors.exportPdfFailed"));
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadDocx = useCallback(async () => {
    if (!tailorResponse) return;

    setIsExportingDocx(true);
    try {
      const filename = `${tailorResponse.tailoredCv.personalInfo.fullName || "cv"}_tailored`;
      await exportToDocx(tailorResponse.tailoredCv, filename);
    } catch (error) {
      console.error("DOCX export failed:", error);
      toast.error(t("errors.exportDocxFailed"));
    } finally {
      setIsExportingDocx(false);
    }
  }, [tailorResponse]);

  const handleSaveToResumes = useCallback(async () => {
    if (!tailorResponse?.tailoredCv) return;

    setIsSavingResume(true);
    try {
      const title = `${tailorResponse.tailoredCv.personalInfo.fullName || "My CV"} - ${jobTitle || "Tailored"}`;
      const saved = await ResumeService.create(
        title,
        tailorResponse.tailoredCv,
      );
      setSavedResumeId(saved.id);
    } catch (error) {
      console.error("Save to resumes failed:", error);
      toast.error(t("errors.saveFailed"));
    } finally {
      setIsSavingResume(false);
    }
  }, [tailorResponse, jobTitle]);

  const handleEditInResumeBuilder = useCallback(async () => {
    if (!tailorResponse?.tailoredCv) return;

    try {
      let targetResumeId = savedResumeId;

      if (!targetResumeId) {
        setIsSavingResume(true);
        const title = `${tailorResponse.tailoredCv.personalInfo.fullName || "My CV"} - ${jobTitle || "Tailored"}`;
        const normalized = ensureUniqueSectionItemIds(
          tailorResponse.tailoredCv,
        ) as ResumeData;
        const saved = await ResumeService.create(title, normalized);
        targetResumeId = saved.id;
        setSavedResumeId(saved.id);
      }

      router.push(`/app/resume-builder?id=${targetResumeId}`);
    } catch (error) {
      console.error("Failed to open in resume builder:", error);
      toast.error(t("errors.saveFailed"));
    } finally {
      setIsSavingResume(false);
    }
  }, [tailorResponse, savedResumeId, jobTitle, router, t]);

  const handleGenerate = useCallback(() => {
    if (!resumeData) return;

    const trimmedDesc = jobDescription.trim();
    if (!trimmedDesc) {
      setJobDescriptionError(t("errors.jobDescRequired"));
      return;
    }
    if (trimmedDesc.length < 50) {
      setJobDescriptionError(t("errors.jobDescMinLength"));
      return;
    }
    setJobDescriptionError("");

    tailorCv(
      {
        resumeData,
        jobDescription,
        jobTitle: jobTitle || undefined,
        companyName: companyName || undefined,
        generateCoverLetter,
        includeInterviewQuestions,
        includeRoadmap,
      },
      {
        onSuccess: (data) => {
          setTailorResponse({
            ...data,
            tailoredCv: {
              ...data.tailoredCv,
              metadata: {
                templateId: "modern",
                primaryColor: "#2563eb",
                fontFamily: "Inter",
                ...(data.tailoredCv.metadata || {}),
              },
            },
          });
          setCurrentStep(4);
        },
      },
    );
  }, [
    resumeData,
    jobDescription,
    jobTitle,
    companyName,
    generateCoverLetter,
    includeInterviewQuestions,
    includeRoadmap,
    tailorCv,
  ]);

  const handleScrapeJd = useCallback(async () => {
    if (!jdUrl) return;

    try {
      new URL(jdUrl);
    } catch (_) {
      toast.error(t("errors.invalidUrl") || "Invalid URL");
      return;
    }

    setIsScraping(true);
    try {
      const content = await JobApplicationService.scrapeJd(jdUrl);
      if (content) {
        setJobDescription(content);
      } else {
        toast.error(t("errors.scrapeEmpty") || "No content found");
      }
    } catch (error) {
      console.error("Scrape failed:", error);
      toast.error(
        t("errors.scrapeFailed") || "Failed to import job description",
      );
    } finally {
      setIsScraping(false);
    }
  }, [jdUrl, t]);

  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setResumeData((prev) =>
      prev
        ? {
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value },
          }
        : null,
    );
  }, []);

  const addSectionItem = useCallback((sectionId: string) => {
    setResumeData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: [
                  ...section.items,
                  {
                    id: `item-${Date.now()}`,
                    title: "",
                    subtitle: "",
                    date: "",
                    description: "",
                    tags: [],
                  },
                ],
              }
            : section,
        ),
      };
    });
  }, []);

  const updateSectionItem = useCallback(
    (
      sectionId: string,
      itemId: string,
      field: string,
      value: string | string[],
    ) => {
      setResumeData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sections: prev.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  items: section.items.map((item) =>
                    item.id === itemId ? { ...item, [field]: value } : item,
                  ),
                }
              : section,
          ),
        };
      });
    },
    [],
  );

  const removeSectionItem = useCallback((sectionId: string, itemId: string) => {
    setResumeData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.filter((item) => item.id !== itemId),
              }
            : section,
        ),
      };
    });
  }, []);

  const addSection = useCallback(
    (type: ResumeSection["type"], title: string) => {
      setResumeData((prev) => {
        if (!prev) return null;
        const newSection: ResumeSection = {
          id: `section-${Date.now()}`,
          title,
          type,
          items: [],
          order: prev.sections.length,
          isVisible: true,
        };
        return {
          ...prev,
          sections: [...prev.sections, newSection],
        };
      });
    },
    [],
  );

  const isResumeValid = useCallback(() => {
    if (!resumeData) return false;
    const { personalInfo } = resumeData;
    return !!(personalInfo.fullName && personalInfo.email);
  }, [resumeData]);

  const getSectionType = (
    section: ResumeSection,
  ): "skills" | "languages" | "default" => {
    const type = section.type.toLowerCase();
    if (type === "skills") return "skills";
    if (type === "languages") return "languages";
    return "default";
  };

  const hasAdditionalFeatures = useMemo(() => {
    if (!tailorResponse) return false;
    return !!(
      tailorResponse.coverLetter ||
      tailorResponse.interviewPrep?.questions?.length ||
      tailorResponse.roadmap?.steps?.length
    );
  }, [tailorResponse]);

  const steps = [
    { id: 1, title: t("steps.uploadCv"), icon: UploadCloud },
    { id: 2, title: t("steps.reviewData"), icon: FileText },
    { id: 3, title: t("steps.generate"), icon: Sparkles },
    { id: 4, title: t("steps.result"), icon: CheckCircle2 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div data-tour="upload-header" className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pageTitle")}</h1>
          <p className="text-muted-foreground mt-2">{t("pageSubtitle")}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleStartTour} 
          className="text-muted-foreground hover:text-foreground hidden sm:flex shrink-0"
        >
          <HelpCircle className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
          {tTour("common.help") || "Tour"}
        </Button>
      </div>

      {/* Stepper */}
      <div data-tour="upload-stepper" className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 sm:gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors
                ${
                  currentStep >= step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span
                className={`ml-2 text-sm font-medium hidden sm:inline ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <Card
            data-tour="upload-dropzone"
            className={`border-dashed border-2 transition-colors ${isDragging ? "border-primary bg-primary/5" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <UploadCloud className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t("uploadCv")}</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {t("uploadCvDesc")}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                size="lg"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                    {t("analyzing")}
                  </>
                ) : (
                  t("selectFile")
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("or")}
              </span>
            </div>
          </div>

          <div data-tour="upload-alternatives" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleManualEntry}
            >
              <FileEdit className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              {t("addManually")}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleOpenResumeSelector}
            >
              <FolderOpen className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              {t("fillFromResumes")}
            </Button>
          </div>
        </div>
      )}

      {/* Resume Selector Dialog */}
      <Dialog open={showResumeSelector} onOpenChange={setShowResumeSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("selectResume.title")}</DialogTitle>
            <DialogDescription>{t("selectResume.subtitle")}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoadingResumes ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("selectResume.loading")}
                </p>
              </div>
            ) : storedResumes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 font-medium">
                  {t("selectResume.noResumes")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("selectResume.noResumesDesc")}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setShowResumeSelector(false);
                    router.push("/app/resume-builder");
                  }}
                >
                  {t("selectResume.createNew")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 rtl:pr-0 rtl:pl-2">
                {storedResumes.map((resume) => (
                  <button
                    key={resume.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-start"
                    onClick={() => handleSelectStoredResume(resume)}
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{resume.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(resume.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground rtl:-scale-x-100" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 2: Review/Edit Data */}
      {currentStep === 2 && resumeData && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Personal Info */}
          <Card data-tour="upload-step2-personal-info">
            <CardHeader>
              <CardTitle>{t("personalInfo.title")}</CardTitle>
              <CardDescription>{t("personalInfo.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("personalInfo.fullName")} *</Label>
                  <Input
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) =>
                      updatePersonalInfo("fullName", e.target.value)
                    }
                    placeholder={t("placeholders.fullName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("personalInfo.email")} *</Label>
                  <Input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) =>
                      updatePersonalInfo("email", e.target.value)
                    }
                    placeholder={t("placeholders.email")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("personalInfo.phone")}</Label>
                  <Input
                    value={resumeData.personalInfo.phone || ""}
                    onChange={(e) =>
                      updatePersonalInfo("phone", e.target.value)
                    }
                    placeholder={t("placeholders.phone")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("personalInfo.jobTitle")}</Label>
                  <Input
                    value={resumeData.personalInfo.jobTitle || ""}
                    onChange={(e) =>
                      updatePersonalInfo("jobTitle", e.target.value)
                    }
                    placeholder={t("placeholders.jobTitle")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("personalInfo.summary")}</Label>
                <Textarea
                  value={resumeData.personalInfo.summary || ""}
                  onChange={(e) =>
                    updatePersonalInfo("summary", e.target.value)
                  }
                  placeholder={t("personalInfo.summaryPlaceholder")}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t("personalInfo.linkedin")}</Label>
                  <Input
                    value={resumeData.personalInfo.linkedin || ""}
                    onChange={(e) =>
                      updatePersonalInfo("linkedin", e.target.value)
                    }
                    placeholder={t("placeholders.linkedin")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("personalInfo.github")}</Label>
                  <Input
                    value={resumeData.personalInfo.github || ""}
                    onChange={(e) =>
                      updatePersonalInfo("github", e.target.value)
                    }
                    placeholder={t("placeholders.github")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("personalInfo.website")}</Label>
                  <Input
                    value={resumeData.personalInfo.website || ""}
                    onChange={(e) =>
                      updatePersonalInfo("website", e.target.value)
                    }
                    placeholder={t("placeholders.website")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Sections */}
          <Accordion
            data-tour="upload-step2-sections"
            type="single"
            collapsible
            defaultValue={resumeData.sections[0]?.id}
            className="space-y-3"
          >
          {resumeData.sections.map((section) => {
            const sectionType = getSectionType(section);

            // Skills Section: Consolidated single-block editing
            if (sectionType === "skills") {
              const allSkills = section.items
                .map((item) => item.title)
                .filter(Boolean);

              return (
                <AccordionItem key={section.id} value={section.id} className="border rounded-lg">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <span className="capitalize font-semibold">{section.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("sections.skillsInput")}</Label>
                      <Textarea
                        value={allSkills.join(", ")}
                        onChange={(e) => {
                          const newSkills = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setResumeData((prev) => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              sections: prev.sections.map((s) =>
                                s.id === section.id
                                  ? {
                                      ...s,
                                      items: newSkills.map((skill, idx) => ({
                                        id: `skill-${idx}`,
                                        title: skill,
                                        subtitle: "",
                                        date: "",
                                        description: "",
                                        location: "",
                                        tags: [],
                                        isVisible: true,
                                      })),
                                    }
                                  : s,
                              ),
                            };
                          });
                        }}
                        placeholder="Java, Spring Boot, Angular, TypeScript, React..."
                        rows={3}
                      />
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>
              );
            }

            // Other sections: Normal item-by-item rendering
            return (
              <AccordionItem key={section.id} value={section.id} className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-2">
                    <span className="capitalize font-semibold">{section.title}</span>
                    <span className="text-xs text-muted-foreground font-normal">{section.items.length} {section.items.length === 1 ? 'item' : 'items'}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); addSectionItem(section.id); }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 space-y-3 relative"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-destructive"
                        onClick={() => removeSectionItem(section.id, item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>

                      {sectionType === "languages" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            value={item.title}
                            onChange={(e) =>
                              updateSectionItem(section.id, item.id, "title", e.target.value)
                            }
                            placeholder="Language (e.g., English)"
                          />
                          <Input
                            value={item.subtitle || ""}
                            onChange={(e) =>
                              updateSectionItem(section.id, item.id, "subtitle", e.target.value)
                            }
                            placeholder="Level (e.g., Native, Fluent)"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                              value={item.title}
                              onChange={(e) =>
                                updateSectionItem(section.id, item.id, "title", e.target.value)
                              }
                              placeholder="Title"
                            />
                            <Input
                              value={item.subtitle || ""}
                              onChange={(e) =>
                                updateSectionItem(section.id, item.id, "subtitle", e.target.value)
                              }
                              placeholder="Subtitle"
                            />
                          </div>
                          <Input
                            value={item.date || ""}
                            onChange={(e) =>
                              updateSectionItem(section.id, item.id, "date", e.target.value)
                            }
                            placeholder="Date"
                          />
                          <Textarea
                            value={item.description || ""}
                            onChange={(e) =>
                              updateSectionItem(section.id, item.id, "description", e.target.value)
                            }
                            placeholder="Description"
                            rows={2}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
          </Accordion>

          <div
            data-tour="upload-step2-actions"
            className="flex justify-between items-center gap-3"
          >
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("actions.back")}
            </Button>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    {t("actions.addSection")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {[
                    { type: "experience", title: t("sections.experience"), match: ["experience", "professional experience"] },
                    { type: "education", title: t("sections.education"), match: ["education"] },
                    { type: "projects", title: t("sections.projects"), match: ["project"] },
                    { type: "skills", title: t("sections.skills"), match: ["skill", "competenc"] },
                    { type: "languages", title: t("sections.languages"), match: ["language"] },
                    { type: "certifications", title: t("sections.certifications"), match: ["course", "certif"] },
                    { type: "custom", title: t("sections.interests"), match: ["interest", "hobby"] },
                    { type: "custom", title: t("sections.activities"), match: ["activit", "volunteer"] },
                  ]
                    .filter((s) => !resumeData.sections.some((existing) => s.match.some((m) => existing.title.toLowerCase().includes(m))))
                    .map((s) => (
                      <DropdownMenuItem
                        key={s.title}
                        onClick={() => addSection(s.type as ResumeSection["type"], s.title.toUpperCase())}
                        className="cursor-pointer"
                      >
                        <Plus className="h-4 w-4 mr-2 text-muted-foreground" />
                        {s.title}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!isResumeValid()}
              >
                {t("upload.generateTailoredCv")}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Job Description */}
      {currentStep === 3 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card data-tour="upload-step3-job-details">
            <CardHeader>
              <CardTitle>{t("upload.targetJobDescription")}</CardTitle>
              <CardDescription>{t("upload.pasteJobDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("upload.jobTitleOptional")}</Label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("upload.companyOptional")}</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Tech Corp"
                  />
                </div>
              </div>

              <div className="space-y-2" data-tour="upload-step3-import-url">
                <Label>{t("upload.importUrl") || "Import from URL"}</Label>
                <div className="flex gap-2">
                  <Input
                    value={jdUrl}
                    onChange={(e) => setJdUrl(e.target.value)}
                    placeholder="https://linkedin.com/jobs/..."
                    disabled={isScraping}
                  />
                  <Button
                    variant="outline"
                    onClick={handleScrapeJd}
                    disabled={!jdUrl || isScraping}
                  >
                    {isScraping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {t("actions.import") || "Import"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("upload.jobDescLabel")} *</Label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    if (jobDescriptionError) setJobDescriptionError("");
                  }}
                  placeholder={t("upload.pasteJobDescPlaceholder")}
                  className={`min-h-[200px] ${jobDescriptionError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {jobDescriptionError && (
                  <p className="text-sm text-red-500">{jobDescriptionError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {jobDescription.length}/50 {t("upload.charsMin")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-tour="upload-step3-options">
            <CardHeader>
              <CardTitle>{t("upload.additionalOptions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("upload.generateCoverLetter")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("upload.coverLetterDesc")}
                  </p>
                </div>
                <Switch
                  checked={generateCoverLetter}
                  onCheckedChange={setGenerateCoverLetter}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("upload.interviewQuestions")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("upload.interviewDesc")}
                  </p>
                </div>
                <Switch
                  checked={includeInterviewQuestions}
                  onCheckedChange={setIncludeInterviewQuestions}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("upload.careerRoadmap")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("upload.roadmapDesc")}
                  </p>
                </div>
                <Switch
                  checked={includeRoadmap}
                  onCheckedChange={setIncludeRoadmap}
                />
              </div>
            </CardContent>
          </Card>

          <div data-tour="upload-step3-generate" className="flex justify-between gap-3">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("actions.back")}
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isTailoring || jobDescription.trim().length < 50}
            >
              {isTailoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("upload.generating")}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("upload.generateTailoredCv")}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {currentStep === 4 && tailorResponse && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card data-tour="upload-step4-downloads">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">{t("upload.cvGenerated")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("upload.cvReadyDesc")}
                  </p>

                  <div className="space-y-2">
                    <Button className="w-full" size="sm" onClick={handleDownloadPdf} disabled={isExportingPdf || isExportingDocx}>
                      <Download className="mr-2 h-4 w-4" />
                      {isExportingPdf ? t("upload.exporting") : t("upload.downloadPdf")}
                    </Button>
                    <Button variant="outline" className="w-full" size="sm" onClick={handleDownloadDocx} disabled={isExportingPdf || isExportingDocx}>
                      <Download className="mr-2 h-4 w-4" />
                      {isExportingDocx ? t("upload.exporting") : t("upload.downloadDocx")}
                    </Button>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" size="sm" onClick={handleSaveToResumes} disabled={isSavingResume || !!savedResumeId}>
                      <Save className="mr-2 h-4 w-4" />
                      {savedResumeId ? t("upload.saved") : isSavingResume ? t("upload.saving") : t("upload.saveToResumes")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Refine Options */}
              <Card data-tour="upload-step4-refine">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("upload.refineResult")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" size="sm" onClick={handleEditInResumeBuilder} disabled={isSavingResume}>
                    <Edit2 className="mr-2 h-4 w-4" />{" "}
                    {isSavingResume ? t("upload.saving") : t("upload.editSections")}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => setCurrentStep(3)}>
                    <RefreshCw className="mr-2 h-4 w-4" />{" "}
                    {t("upload.regenerateVariant")}
                  </Button>
                  <Separator className="my-2" />
                  <div className="space-y-2 pt-1">
                    <Label className="text-xs text-muted-foreground">Template</Label>
                    <Select 
                      value={tailorResponse.tailoredCv.metadata?.templateId || "modern"} 
                      onValueChange={(val) => {
                        setTailorResponse(prev => prev ? {
                          ...prev,
                          tailoredCv: { ...prev.tailoredCv, metadata: { ...(prev.tailoredCv.metadata || {}), templateId: val as TemplateType } }
                        } : prev);
                      }}
                    >
                      <SelectTrigger className="w-full h-8 text-sm">
                        <SelectValue placeholder="Modern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* ATS Score */}
              <Card data-tour="upload-step4-ats">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("upload.atsMatchScore")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tailorResponse.originalAtsScore && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">{t("upload.before")}</p>
                        <span className={`text-xl font-bold ${getScoreColor(tailorResponse.originalAtsScore.overall)}`}>
                          {tailorResponse.originalAtsScore.overall}%
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        {tailorResponse.atsScore.overall > tailorResponse.originalAtsScore.overall && (
                          <span className="text-xs text-green-600 font-semibold">
                            +{tailorResponse.atsScore.overall - tailorResponse.originalAtsScore.overall}%
                          </span>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">{t("upload.after")}</p>
                        <span className={`text-xl font-bold ${getScoreColor(tailorResponse.atsScore.overall)}`}>
                          {tailorResponse.atsScore.overall}%
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-bold ${getScoreColor(tailorResponse.atsScore.overall)}`}>
                        {tailorResponse.atsScore.overall}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {tailorResponse.originalAtsScore ? "Optimized Score" : "Match Rate"}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getScoreBarColor(tailorResponse.atsScore.overall)}`}
                        style={{ width: `${tailorResponse.atsScore.overall}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Keywords</p>
                        <p className="font-semibold">{tailorResponse.atsScore.keywordMatch}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Skills</p>
                        <p className="font-semibold">{tailorResponse.atsScore.skillsMatch}%</p>
                      </div>
                    </div>
                  </div>

                  {tailorResponse.atsScore.missingKeywords && tailorResponse.atsScore.missingKeywords.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Missing Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tailorResponse.atsScore.missingKeywords.slice(0, 10).map((keyword, i) => (
                          <span key={i} className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card data-tour="upload-step4-preview">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Preview</CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch checked={maskPII} onCheckedChange={setMaskPII} id="mask-pii" />
                    <Label htmlFor="mask-pii" className="text-sm flex items-center gap-1">
                      {maskPII ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      Mask Personal Info
                    </Label>
                  </div>
                </CardHeader>
                <CardContent>
                  <div ref={previewContainerRef} className="flex-1 overflow-auto w-full flex justify-center py-4 bg-muted/10 rounded-lg">
                    <div
                      className="origin-top transition-transform duration-200 ease-in-out shrink-0"
                      style={{
                        transform: `scale(${previewScale})`,
                        height: previewScaledHeight ? `${previewScaledHeight}px` : "auto",
                      }}
                    >
                      <div ref={cvPreviewRef}>
                        <ResumePreview
                          data={{
                            ...tailorResponse.tailoredCv,
                            personalInfo: maskPII
                              ? {
                                  ...tailorResponse.tailoredCv.personalInfo,
                                  fullName: "••••••••",
                                  email: tailorResponse.tailoredCv.personalInfo.email ? "••••••••@••••.•••" : "",
                                  phone: tailorResponse.tailoredCv.personalInfo.phone ? "•••••••••••" : "",
                                  linkedin: tailorResponse.tailoredCv.personalInfo.linkedin ? "••••••••" : "",
                                  github: tailorResponse.tailoredCv.personalInfo.github ? "••••••••" : "",
                                  website: tailorResponse.tailoredCv.personalInfo.website ? "••••••••" : "",
                                }
                              : tailorResponse.tailoredCv.personalInfo,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Features Tabs - Below the main content */}
          {hasAdditionalFeatures && (
            <Card data-tour="upload-step4-additional-tabs">
              <CardContent className="p-0">
                  <Tabs
                  defaultValue={
                    tailorResponse.coverLetter
                      ? "cover-letter"
                      : tailorResponse.interviewPrep?.questions?.length
                        ? "interview"
                        : tailorResponse.roadmap?.steps?.length ? "roadmap" : "cover-letter"
                  }
                >
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                    {tailorResponse.coverLetter && (
                      <TabsTrigger
                        value="cover-letter"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Cover Letter
                      </TabsTrigger>
                    )}
                    {(tailorResponse.interviewPrep?.questions?.length ?? 0) > 0 && (
                      <TabsTrigger
                        value="interview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Interview Prep
                      </TabsTrigger>
                    )}
                    {(tailorResponse.roadmap?.steps?.length ?? 0) > 0 && (
                      <TabsTrigger
                        value="roadmap"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <Map className="h-4 w-4 mr-2" />
                        Career Roadmap
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {/* Cover Letter Tab */}
                  {tailorResponse.coverLetter && (
                    <TabsContent value="cover-letter" className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">
                            Generated Cover Letter
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Tailored to the job description
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              tailorResponse.coverLetter || "",
                            );
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                          {tailorResponse.coverLetter}
                        </pre>
                      </div>
                    </TabsContent>
                  )}

                  {/* Interview Tab */}
                  {(tailorResponse.interviewPrep?.questions?.length ?? 0) > 0 && (
                    <TabsContent value="interview" className="p-6">
                      <div className="mb-4">
                        <h3 className="font-semibold">
                          Potential Interview Questions
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Based on the job requirements and your experience
                        </p>
                      </div>
                      <div className="space-y-3">
                        {tailorResponse.interviewPrep?.questions?.map((q, i) => (
                          <div key={i} className="p-4 bg-muted rounded-lg">
                            <div className="flex items-start justify-between gap-4">
                              <p className="font-medium">
                                <span className="text-primary mr-2">
                                  Q{i + 1}:
                                </span>
                                {q.question}
                              </p>
                              {q.category && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded capitalize whitespace-nowrap">
                                  {q.category}
                                </span>
                              )}
                            </div>
                            {q.hint && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <strong>Hint:</strong> {q.hint}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}

                  {/* Roadmap Tab */}
                  {(tailorResponse.roadmap?.steps?.length ?? 0) > 0 && (
                    <TabsContent value="roadmap" className="p-6">
                      <div className="mb-4">
                        <h3 className="font-semibold">
                          Career Development Roadmap
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Skills and steps to improve your fit for this role
                        </p>
                      </div>

                      {(tailorResponse.roadmap?.skillGaps?.length ?? 0) > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium mb-2">
                              Skills to Develop
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {tailorResponse.roadmap?.skillGaps?.map(
                                (skill, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      <div className="space-y-3">
                        {tailorResponse.roadmap?.steps?.map((step, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                          >
                            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{step.step}</p>
                              {step.timeframe && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  ⏱️ {step.timeframe}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </div>
      )}

      {/* Token Limit Exceeded Modal */}
      <AlertDialog
        open={showTokenLimitModal}
        onOpenChange={setShowTokenLimitModal}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <Zap className="h-6 w-6 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-center">
              {t("tokenLimit.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t("tokenLimit.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-3 py-4">
            <Link href="/plans" className="w-full">
              <Button className="w-full" size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                {t("tokenLimit.upgrade")}
              </Button>
            </Link>
            <Link href="/app/tokens" className="w-full">
              <Button variant="outline" className="w-full" size="lg">
                <CreditCard className="mr-2 h-4 w-4" />
                {t("tokenLimit.buyTokens")}
              </Button>
            </Link>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="w-full">
              {t("tokenLimit.cancel")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AuthGateDialog
        open={showAuthGate}
        onOpenChange={setShowAuthGate}
        returnTo="/app/upload"
      />
    </div>
  );
}
