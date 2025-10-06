"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useDatabase } from "@/hooks/use-database";
import { useAuth } from "@/context/auth-context";
import { CVData, JobApplication } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/app/Loader";
import { generateCoverLetter as generateCoverLetterFlow } from "@/ai/flows/cover-letter-generation";
import { exportToPdf, exportToPdfAsText, exportAsTextFile } from "@/lib/pdf";
import {
  ArrowLeft,
  Download,
  FileText,
  Image,
  Copy,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CVViewPage({ params }: { params: { id: string } }) {
  const { user, isHydrated } = useAuth();
  const database = useDatabase();
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [cv, setCv] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [maskPersonalDetails, setMaskPersonalDetails] = useState(false);
  const [showCoverLetterForm, setShowCoverLetterForm] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);

  // Refs for export functionality
  const cvContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
      return;
    }
    if (database && params.id) {
      Promise.all([
        database.getCVData(params.id),
        database.getAllJobApplications(),
      ])
        .then(([cvData, jobApps]) => {
          setCv(cvData);
          setJobApplications(jobApps.filter((app) => app.cvId === params.id));
        })
        .finally(() => setLoading(false));
    }
  }, [user, isHydrated, database, params.id, router]);

  // Masking utility functions
  const maskEmail = (email: string): string => {
    if (!email) return "[Email Hidden]";
    const [username, domain] = email.split("@");
    if (!domain) return "[Email Hidden]";
    return `${"*".repeat(Math.min(username.length, 3))}@${"*".repeat(
      Math.min(domain.split(".")[0].length, 3)
    )}.${domain.split(".").slice(1).join(".")}`;
  };

  const maskPhone = (phone: string): string => {
    if (!phone) return "[Phone Hidden]";
    return phone.replace(/\d/g, "*");
  };

  const maskPersonalInfo = (text: string): string => {
    if (!maskPersonalDetails || !cv) return text;

    let maskedText = text;

    // Mask name
    if (cv.profile.name) {
      const nameRegex = new RegExp(
        cv.profile.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      maskedText = maskedText.replace(nameRegex, "[Name Hidden]");
    }

    // Mask email
    if (cv.profile.email) {
      const emailRegex = new RegExp(
        cv.profile.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      maskedText = maskedText.replace(emailRegex, maskEmail(cv.profile.email));
    }

    // Mask phone
    if (cv.profile.phone) {
      const phoneRegex = new RegExp(
        cv.profile.phone.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      maskedText = maskedText.replace(phoneRegex, maskPhone(cv.profile.phone));
    }

    // Mask common social media patterns
    maskedText = maskedText.replace(
      /https?:\/\/(www\.)?(linkedin|github|twitter|facebook|instagram)\.com\/[^\s]+/gi,
      "[Social Profile Hidden]"
    );
    maskedText = maskedText.replace(
      /linkedin\.com\/in\/[^\s]+/gi,
      "[LinkedIn Hidden]"
    );
    maskedText = maskedText.replace(/github\.com\/[^\s]+/gi, "[GitHub Hidden]");

    return maskedText;
  };

  // Cover letter generation
  const handleGenerateCoverLetter = async () => {
    if (!cv) return;

    if (!jobDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Job Description Required",
        description:
          "Please enter a job description to generate a cover letter.",
      });
      return;
    }

    setGeneratingCoverLetter(true);
    try {
      // Create user profile string for the cover letter generation
      const userProfile = maskPersonalDetails
        ? `Name: [Name Hidden]\nEmail: [Email Hidden]\nPhone: [Phone Hidden]\n\nSummary: ${cv.profile.summary}\nExperience: ${cv.profile.experience}\nEducation: ${cv.profile.education}\nSkills: ${cv.profile.skills}`
        : `Name: ${cv.profile.name}\nEmail: ${cv.profile.email}\nPhone: ${cv.profile.phone}\n\nSummary: ${cv.profile.summary}\nExperience: ${cv.profile.experience}\nEducation: ${cv.profile.education}\nSkills: ${cv.profile.skills}`;

      const result = await generateCoverLetterFlow({
        jobDescription: jobDescription,
        userProfile: userProfile,
      });

      setCoverLetter(result.coverLetter);

      // Save to database if not masked
      if (database && !maskPersonalDetails) {
        await database.saveJobApplication({
          cvId: cv.id,
          jobTitle: "Generated Application",
          company: "Unknown Company",
          jobDescription: jobDescription,
          coverLetter: result.coverLetter,
          applicationStatus: "draft",
        });
      }

      toast({
        title: "Cover Letter Generated!",
        description: "Your personalized cover letter has been created.",
      });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Failed to generate cover letter. Please try again.",
      });
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  // Export handlers
  const handleCopyCV = async () => {
    if (!cv) return;
    const textToCopy = maskPersonalInfo(cv.rawText);
    await navigator.clipboard.writeText(textToCopy);
    toast({
      title: "CV Copied",
      description: "CV content has been copied to clipboard.",
    });
  };

  const handleCopyCoverLetter = async () => {
    if (!coverLetter) return;
    const textToCopy = maskPersonalDetails
      ? maskPersonalInfo(coverLetter)
      : coverLetter;
    await navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Cover Letter Copied",
      description: "Cover letter has been copied to clipboard.",
    });
  };

  const handleExportPdfText = async () => {
    if (!cv) return;
    const cvContent = maskPersonalInfo(cv.rawText);
    const coverLetterContent =
      coverLetter && maskPersonalDetails
        ? maskPersonalInfo(coverLetter)
        : coverLetter;
    const filename = `${cv.fileName.replace(/\.[^/.]+$/, "")}_${
      maskPersonalDetails ? "masked" : "full"
    }.pdf`;
    await exportToPdfAsText(cvContent, coverLetterContent, filename);
    toast({
      title: "PDF Exported",
      description: `CV exported as ${filename}`,
    });
  };

  const handleExportPdfImage = async () => {
    if (!cvContainerRef.current || !cv) return;
    const filename = `${cv.fileName.replace(/\.[^/.]+$/, "")}_${
      maskPersonalDetails ? "masked" : "full"
    }.pdf`;
    await exportToPdf(cvContainerRef.current, null, filename);
    toast({
      title: "PDF Exported",
      description: `CV exported as ${filename}`,
    });
  };

  const handleExportText = async () => {
    if (!cv) return;
    const textToExport = maskPersonalInfo(cv.rawText);
    const filename = `${cv.fileName.replace(/\.[^/.]+$/, "")}_${
      maskPersonalDetails ? "masked" : "full"
    }.txt`;
    exportAsTextFile(textToExport, filename);
    toast({
      title: "Text File Exported",
      description: `CV exported as ${filename}`,
    });
  };

  if (loading) return <Loader message="Loading CV..." />;
  if (!cv) return <div className="p-8 text-center">CV not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {cv.fileName}
              </h1>
              <p className="text-gray-600">
                Created: {new Date(cv.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="mask-toggle" className="text-sm font-medium">
              {maskPersonalDetails ? (
                <div className="flex items-center gap-2 text-orange-600">
                  <EyeOff className="h-4 w-4" />
                  Anonymous Mode
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <Eye className="h-4 w-4" />
                  Full Details
                </div>
              )}
            </Label>
            <Switch
              id="mask-toggle"
              checked={maskPersonalDetails}
              onCheckedChange={setMaskPersonalDetails}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CV Display */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    Your CV
                    {maskPersonalDetails && (
                      <Badge variant="secondary" className="ml-2">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Masked
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    {maskPersonalDetails
                      ? "Personal details are hidden for privacy"
                      : "Review your complete CV with all details"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCopyCV} variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleExportPdfText}>
                        <FileText className="mr-2 h-4 w-4" />
                        Text-based PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportPdfImage}>
                        <Image className="mr-2 h-4 w-4" />
                        Image-based PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportText}>
                        <FileText className="mr-2 h-4 w-4" />
                        Plain Text File
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  ref={cvContainerRef}
                  className="p-8 bg-white rounded-xl shadow-inner border-2 border-gray-100"
                >
                  <div
                    className="resume-output whitespace-pre-wrap text-sm leading-relaxed"
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {maskPersonalInfo(cv.rawText)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Letter Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Generate Cover Letter
                </CardTitle>
                <CardDescription>
                  Create a personalized cover letter for a specific job
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="job-description">Job Description</Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingCoverLetter || !jobDescription.trim()}
                  className="w-full"
                >
                  {generatingCoverLetter ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Cover Letter */}
            {coverLetter && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Cover Letter
                    </CardTitle>
                    <Button
                      onClick={handleCopyCoverLetter}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg border max-h-96 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {maskPersonalDetails
                        ? maskPersonalInfo(coverLetter)
                        : coverLetter}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Applications History */}
            {jobApplications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Applications</CardTitle>
                  <CardDescription>
                    Job applications using this CV
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {jobApplications.slice(0, 3).map((app) => (
                      <div
                        key={app.id}
                        className="p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {app.jobTitle}
                            </p>
                            <p className="text-xs text-gray-600">
                              {app.company}
                            </p>
                          </div>
                          <Badge
                            variant={
                              app.applicationStatus === "applied"
                                ? "default"
                                : app.applicationStatus === "interview"
                                ? "secondary"
                                : app.applicationStatus === "accepted"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {app.applicationStatus}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
