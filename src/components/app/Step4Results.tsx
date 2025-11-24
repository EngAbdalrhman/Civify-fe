"use client";
import { useRouter } from "next/navigation";
// ... imports

export default function Step4Results({
  prevStep,
  formData,
}: Step4ResultsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  // ... state

  // ... (masking functions)

  const handleSaveToFirebase = async () => {
    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }
    if (!database) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Database connection not available.",
      });
      return;
    }

    setSaving(true);
    // ... rest of save logic
  };

  // ... useEffect

  const handleExportPdfImage = async () => {
    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }
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
    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }
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
    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }
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
