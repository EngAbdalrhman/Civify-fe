"use client";

import { useState, useEffect, useRef } from "react";
import { tailorCv } from "@/ai/flows/cv-tailoring";
import { generateCoverLetter as generateCoverLetterFlow } from "@/ai/flows/cover-letter-generation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useDatabase } from "@/hooks/use-database";
import { Loader } from "./Loader";
import { exportToPdf, exportToPdfAsText, exportAsTextFile } from "@/lib/pdf";
import type { FormData } from "@/app/page";
import {
  Copy,
  Download,
  FileText,
  Image,
  CheckCircle,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Step4ResultsProps {
  prevStep: () => void;
  formData: FormData;
}

export default function Step4Results({
  prevStep,
  formData,
}: Step4ResultsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tailoredCv, setTailoredCv] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [generationStatus, setGenerationStatus] = useState<
    "cv" | "cover-letter" | "complete"
  >("cv");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [maskPersonalDetails, setMaskPersonalDetails] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const database = useDatabase();

  const cvContainerRef = useRef<HTMLDivElement>(null);

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
    if (!maskPersonalDetails || !formData.profile) return text;

    let maskedText = text;

    // Mask name
    if (formData.profile.name) {
      const nameRegex = new RegExp(
        formData.profile.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      maskedText = maskedText.replace(nameRegex, "[Name Hidden]");
    }

    // Mask email
    if (formData.profile.email) {
      const emailRegex = new RegExp(
        formData.profile.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      maskedText = maskedText.replace(
        emailRegex,
        maskEmail(formData.profile.email)
      );
    }

    // Mask phone
    if (formData.profile.phone) {
      const phoneRegex = new RegExp(
        formData.profile.phone.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      maskedText = maskedText.replace(
        phoneRegex,
        maskPhone(formData.profile.phone)
      );
    }

    // Mask address patterns (generic address detection)
    maskedText = maskedText.replace(
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b[^,\n]*(?:,\s*[A-Za-z\s]+)?(?:,\s*[A-Z]{2}\s*\d{5})?/gi,
      "[Address Hidden]"
    );

    // Mask social media profiles - more comprehensive patterns
    // LinkedIn patterns
    maskedText = maskedText.replace(
      /https?:\/\/(www\.)?linkedin\.com\/in\/[^\s<>]+/gi,
      "[LinkedIn Hidden]"
    );
    maskedText = maskedText.replace(
      /linkedin\.com\/in\/[^\s<>]+/gi,
      "[LinkedIn Hidden]"
    );
    maskedText = maskedText.replace(
      /LinkedIn:\s*[^\s<>|]+/gi,
      "LinkedIn: [Hidden]"
    );
    maskedText = maskedText.replace(
      /LinkedIn:\s+[a-zA-Z0-9._-]+/gi,
      "LinkedIn: [Hidden]"
    );

    // GitHub patterns
    maskedText = maskedText.replace(
      /https?:\/\/(www\.)?github\.com\/[^\s<>]+/gi,
      "[GitHub Hidden]"
    );
    maskedText = maskedText.replace(
      /github\.com\/[^\s<>]+/gi,
      "[GitHub Hidden]"
    );
    maskedText = maskedText.replace(
      /GitHub:\s*[^\s<>|]+/gi,
      "GitHub: [Hidden]"
    );
    maskedText = maskedText.replace(
      /GitHub:\s+[a-zA-Z0-9._-]+/gi,
      "GitHub: [Hidden]"
    );

    // General social media patterns
    maskedText = maskedText.replace(
      /https?:\/\/(www\.)?(twitter|facebook|instagram)\.com\/[^\s<>]+/gi,
      "[Social Profile Hidden]"
    );

    // Portfolio/website patterns
    maskedText = maskedText.replace(
      /Portfolio:\s*https?:\/\/[^\s<>]+/gi,
      "Portfolio: [Hidden]"
    );
    maskedText = maskedText.replace(
      /Website:\s*https?:\/\/[^\s<>]+/gi,
      "Website: [Hidden]"
    );

    // Generic URL patterns that might be personal
    maskedText = maskedText.replace(
      /https?:\/\/[a-zA-Z0-9.-]+\.(com|org|net|io|dev|me)\/[^\s<>]+/gi,
      "[Personal Link Hidden]"
    );

    return maskedText;
  };

  const handleSaveToFirebase = async () => {
    if (!database || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to save your CV.",
      });
      return;
    }

    setSaving(true);
    try {
      // Save CV data to Firebase
      const cvId = await database.saveCVData({
        fileName: formData.cvFileName || "Untitled CV",
        rawText: formData.rawCvText,
        structuredData: formData.structuredCvData,
        profile: formData.profile,
      });

      // Save job application if job description was provided
      if (formData.jobDescription.trim()) {
        await database.saveJobApplication({
          cvId,
          jobTitle: "Job Application",
          company: "Unknown Company",
          jobDescription: formData.jobDescription,
          tailoredCV: tailoredCv,
          coverLetter: formData.generateCoverLetter ? coverLetter : undefined,
          applicationStatus: "draft",
        });
      }

      // Save generated content
      if (tailoredCv) {
        await database.saveGeneratedContent({
          cvId,
          type: "tailored_cv",
          content: tailoredCv,
          prompt: `Job Description: ${formData.jobDescription}`,
        });
      }

      if (coverLetter && formData.generateCoverLetter) {
        await database.saveGeneratedContent({
          cvId,
          type: "cover_letter",
          content: coverLetter,
          prompt: `Job Description: ${formData.jobDescription}`,
        });
      }

      setSaved(true);
      toast({
        title: "CV Saved Successfully!",
        description:
          "Your CV and generated content have been saved to your account.",
      });
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save your CV. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const generateDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        // Generate CV
        setGenerationStatus("cv");

        // Ensure we have structured CV data
        if (!formData.structuredCvData) {
          throw new Error(
            "No structured CV data available. Please go back and re-upload your CV."
          );
        }

        console.log(
          "Generating CV with structured data:",
          formData.structuredCvData
        );
        console.log("Job description:", formData.jobDescription);

        const cvResult = await tailorCv({
          structuredCvData: formData.structuredCvData,
          jobDescription: formData.jobDescription,
        });

        if (cvResult?.tailoredCv) {
          setTailoredCv(cvResult.tailoredCv);
        } else {
          throw new Error("Failed to generate tailored CV.");
        }

        // Generate Cover Letter if requested
        if (formData.generateCoverLetter) {
          setGenerationStatus("cover-letter");

          // Create comprehensive user profile from structured data
          const userProfile = formData.structuredCvData
            ? `
            Personal Information:
            Name: ${
              formData.structuredCvData.personalInfo?.fullName ||
              formData.profile.name
            }
            Email: ${
              formData.structuredCvData.personalInfo?.email ||
              formData.profile.email
            }
            Phone: ${
              formData.structuredCvData.personalInfo?.phone ||
              formData.profile.phone
            }
            
            Professional Summary:
            ${
              formData.structuredCvData.professionalSummary ||
              formData.profile.summary
            }
            
            Work Experience:
            ${
              formData.structuredCvData.workExperience
                ?.map(
                  (exp: any) =>
                    `${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n${exp.description}`
                )
                .join("\n\n") || formData.profile.experience
            }
            
            Education:
            ${
              formData.structuredCvData.education
                ?.map(
                  (edu: any) =>
                    `${edu.degree} from ${edu.institution} (${edu.graduationDate})`
                )
                .join("\n") || formData.profile.education
            }
            
            Skills:
            Technical: ${
              formData.structuredCvData.skills?.technical?.join(", ") || ""
            }
            Soft Skills: ${
              formData.structuredCvData.skills?.soft?.join(", ") || ""
            }
            Certifications: ${
              formData.structuredCvData.skills?.certifications?.join(", ") || ""
            }
            ${formData.profile.skills}
          `
            : `
            Name: ${formData.profile.name}
            Email: ${formData.profile.email}
            Phone: ${formData.profile.phone}
            Professional Summary: ${formData.profile.summary}
            Work Experience: ${formData.profile.experience}
            Education: ${formData.profile.education}
            Skills: ${formData.profile.skills}
          `;

          const coverLetterResult = await generateCoverLetterFlow({
            jobDescription: formData.jobDescription,
            userProfile: userProfile,
          });

          if (coverLetterResult?.coverLetter) {
            setCoverLetter(coverLetterResult.coverLetter);
          }
        }

        setGenerationStatus("complete");
      } catch (err) {
        console.error("CV generation error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to generate documents. ${errorMessage}`);
        toast({
          title: "Generation Failed",
          description: `There was an error generating your documents. ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    generateDocuments();
  }, [formData, toast]);

  const handleExportPdfImage = async () => {
    if (!cvContainerRef.current) {
      toast({
        title: "Error",
        description: "Cannot find content to export.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Exporting...",
      description: "Your image-based PDF is being generated.",
    });
    await exportToPdf(cvContainerRef.current, null);
  };

  const handleExportPdfText = async () => {
    if (!tailoredCv) {
      toast({
        title: "Error",
        description: "No CV content to export.",
        variant: "destructive",
      });
      return;
    }

    const cvContent = maskPersonalInfo(tailoredCv);
    const coverLetterContent = coverLetter
      ? maskPersonalInfo(coverLetter)
      : undefined;
    const filename = `Tailored-CV${maskPersonalDetails ? "_masked" : ""}.pdf`;

    toast({
      title: "Exporting...",
      description: `Your ${
        maskPersonalDetails ? "masked " : ""
      }text-based PDF is being generated.`,
    });
    await exportToPdfAsText(cvContent, coverLetterContent, filename);
  };

  const handleExportText = () => {
    if (!tailoredCv) {
      toast({
        title: "Error",
        description: "No CV content to export.",
        variant: "destructive",
      });
      return;
    }

    const textContent = maskPersonalInfo(tailoredCv);
    const filename = `Tailored-CV${maskPersonalDetails ? "_masked" : ""}.txt`;

    exportAsTextFile(textContent, filename);
    toast({
      title: "Exported!",
      description: `CV exported as ${
        maskPersonalDetails ? "masked " : ""
      }text file.`,
    });
  };

  const handleCopyCv = () => {
    if (tailoredCv) {
      // Apply masking if enabled
      const contentToCopy = maskPersonalInfo(tailoredCv);

      // Create a more formatted plain text version for copying
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = contentToCopy;

      // Process HTML to create formatted plain text
      const formatForClipboard = (element: Element): string => {
        const tagName = element.tagName?.toLowerCase();
        const text = element.textContent?.trim() || "";

        if (!text) return "";

        switch (tagName) {
          case "h1":
            return `${text}\n${"=".repeat(text.length)}\n\n`;
          case "h2":
            return `\n${text.toUpperCase()}\n${"-".repeat(text.length)}\n`;
          case "h3":
            return `\n${text}\n`;
          case "p":
            return `${text}\n\n`;
          case "li":
            return `• ${text}\n`;
          case "strong":
          case "b":
            return text; // Keep text but remove formatting for ATS
          default:
            if (element.children.length === 0) {
              return text + "\n";
            }
            return "";
        }
      };

      // Walk through elements and build formatted text
      const walkAndFormat = (element: Element): string => {
        let result = "";

        if (element.children.length === 0) {
          result += formatForClipboard(element);
        } else {
          if (
            ["h1", "h2", "h3", "p"].includes(element.tagName?.toLowerCase())
          ) {
            result += formatForClipboard(element);
          } else if (element.tagName?.toLowerCase() === "ul") {
            Array.from(element.children).forEach((child) => {
              result += formatForClipboard(child);
            });
            result += "\n";
          } else {
            Array.from(element.children).forEach((child) => {
              result += walkAndFormat(child);
            });
          }
        }

        return result;
      };

      let formattedText = "";
      Array.from(tempDiv.children).forEach((child) => {
        formattedText += walkAndFormat(child);
      });

      // Clean up excessive newlines while preserving structure
      const cleanText = formattedText.replace(/\n{3,}/g, "\n\n").trim();

      navigator.clipboard.writeText(cleanText);
      toast({
        title: "Copied!",
        description: "CV content copied to clipboard in ATS-friendly format.",
      });
    }
  };

  const handleCopyCoverLetter = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(
        coverLetter.replace(/<br \/>/g, "\n").replace(/<br>/g, "\n")
      );
      toast({
        title: "Copied!",
        description: "Cover letter copied to clipboard.",
      });
    }
  };

  const getStatusMessage = () => {
    switch (generationStatus) {
      case "cv":
        return "AI is crafting your tailored CV...";
      case "cover-letter":
        return "Generating your personalized cover letter...";
      case "complete":
        return "Documents generated successfully!";
      default:
        return "AI is working on your documents...";
    }
  };

  if (loading) {
    return (
      <Card className="shadow-xl rounded-2xl">
        <CardContent className="p-12">
          <Loader message={getStatusMessage()} />
          {generationStatus === "complete" && (
            <div className="flex items-center justify-center mt-4 text-green-600">
              <CheckCircle className="w-6 h-6 mr-2" />
              <span className="font-medium">Ready to download!</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-xl rounded-2xl border-destructive">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-destructive">
            Generation Failed
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={prevStep}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            Go Back and Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              Your Tailored CV
              {maskPersonalDetails && (
                <Badge variant="secondary" className="text-sm">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Masked
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Review your AI-optimized curriculum vitae, perfectly tailored for
              the target role.
              {maskPersonalDetails && (
                <span className="block text-orange-600 font-medium mt-1">
                  Personal details are hidden for privacy
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-4">
            {/* Privacy Toggle */}
            <div className="flex items-center justify-end space-x-3">
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

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSaveToFirebase}
                variant={saved ? "default" : "outline"}
                size="lg"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save to Account
                  </>
                )}
              </Button>
              <Button onClick={handleCopyCv} variant="outline" size="lg">
                <Copy className="mr-2 h-4 w-4" />
                Copy Text
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CV
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportPdfText}>
                    <FileText className="mr-2 h-4 w-4" />
                    Text-based PDF (Recommended)
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
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={cvContainerRef}
            className="p-8 bg-white rounded-xl shadow-inner border-2 border-gray-100"
          >
            <div
              className="resume-output"
              dangerouslySetInnerHTML={{ __html: maskPersonalInfo(tailoredCv) }}
            />
          </div>
        </CardContent>
      </Card>

      {formData.generateCoverLetter && coverLetter && (
        <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white to-green-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-3xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Your Cover Letter
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                A compelling, personalized cover letter crafted specifically for
                this role.
              </CardDescription>
            </div>
            <Button onClick={handleCopyCoverLetter} variant="outline" size="lg">
              <Copy className="mr-2 h-4 w-4" />
              Copy Text
            </Button>
          </CardHeader>
          <CardContent>
            <div className="p-8 bg-white rounded-xl shadow-inner border-2 border-gray-100 text-gray-800">
              <div
                className="cover-letter-output prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: coverLetter.replace(/\n/g, "<br />"),
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center py-6">
        <Button variant="outline" onClick={prevStep} size="lg">
          Back to Edit
        </Button>
        <div className="text-center">
          <p className="text-sm text-gray-500">
            ✨ Your documents are ready! Choose your preferred export format
            above.
          </p>
        </div>
      </div>
    </div>
  );
}
