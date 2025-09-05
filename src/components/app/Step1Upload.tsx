"use client";
import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UploadCloud, FileText, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "./Loader";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { extractTextFromPdf } from "@/lib/pdf";
import { parseCv } from "@/ai/flows/cv-parsing";
import { useDatabase } from "@/hooks/use-database";
import { useAuth } from "@/context/auth-context";

interface Step1UploadProps {
  nextStep: () => void;
  updateFormData: (data: {
    cvFileName: string;
    rawCvText: string;
    structuredCvData?: any;
  }) => void;
}

export default function Step1Upload({
  nextStep,
  updateFormData,
}: Step1UploadProps) {
  const database = useDatabase();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [parsingStatus, setParsingStatus] = useState<
    "idle" | "extracting" | "parsing" | "complete"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
        return;
      }

      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a PDF file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setParsingStatus("idle");
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files ? e.target.files[0] : null);
  };

  const onDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
  };

  const handleProceed = async () => {
    if (file) {
      setIsParsing(true);
      try {
        // Step 1: Extract text from PDF
        setParsingStatus("extracting");
        const text = await extractTextFromPdf(file);

        // Step 2: Parse CV structure with AI
        setParsingStatus("parsing");
        const structuredData = await parseCv({ cvText: text });

        console.log("Parsed structured CV data:", structuredData);

        setParsingStatus("complete");

        updateFormData({
          cvFileName: file.name,
          rawCvText: text,
          structuredCvData: structuredData,
        });

        // Automatically save CV to Realtime Database
        if (database && user) {
          try {
            await database.saveCVData({
              fileName: file.name,
              rawText: text,
              structuredData: {
                personalInfo: structuredData?.personalInfo || {},
                summary: structuredData?.summary || "",
                experience: structuredData?.experience || [],
                education: structuredData?.education || [],
                skills: structuredData?.skills || [],
                certifications: structuredData?.certifications || [],
                languages: structuredData?.languages || [],
                projects: structuredData?.projects || [],
              },
              profile: {
                name: structuredData?.personalInfo?.name || "",
                email: structuredData?.personalInfo?.email || "",
                phone: structuredData?.personalInfo?.phone || "",
                summary: structuredData?.summary || "",
                experience: JSON.stringify(structuredData?.experience || []),
                education: JSON.stringify(structuredData?.education || []),
                skills: JSON.stringify(structuredData?.skills || []),
              },
            });
            toast({
              title: "CV Saved!",
              description: "Your CV has been saved to your account.",
            });
          } catch (dbError) {
            console.error("Error saving CV to DB:", dbError);
            toast({
              title: "Database Error",
              description: "Could not save your CV to your account.",
              variant: "destructive",
            });
          }
        }

        console.log("Updated form data with structured CV data");

        toast({
          title: "CV Processed Successfully!",
          description: "Your CV has been analyzed and is ready for tailoring.",
        });

        setTimeout(() => {
          nextStep();
        }, 1000);
      } catch (error) {
        console.error("CV processing error:", error);
        toast({
          title: "CV Processing Error",
          description:
            "Could not process your CV. Please ensure it's a valid, text-based PDF and try again.",
          variant: "destructive",
        });
        setParsingStatus("idle");
      } finally {
        setIsParsing(false);
      }
    }
  };

  const getStatusMessage = () => {
    switch (parsingStatus) {
      case "extracting":
        return "Extracting text from your CV...";
      case "parsing":
        return "AI is analyzing your CV structure...";
      case "complete":
        return "CV processed successfully!";
      default:
        return "Processing your CV...";
    }
  };

  if (isParsing) {
    return (
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-12">
          <Loader message={getStatusMessage()} />
          {parsingStatus === "complete" && (
            <div className="flex items-center justify-center mt-4 text-green-600">
              <CheckCircle className="w-6 h-6 mr-2" />
              <span className="font-medium">Ready to continue!</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-2xl animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Upload Your CV
        </CardTitle>
        <CardDescription className="text-lg">
          Begin by uploading your CV in PDF format. Our AI will extract and
          analyze your information with 100% accuracy.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-6">
          <label
            htmlFor="cv-upload"
            className={cn(
              "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300",
              isDragging
                ? "border-blue-500 bg-blue-50 scale-105"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            )}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud
                className={cn(
                  "w-12 h-12 mb-4 transition-colors duration-300",
                  isDragging ? "text-blue-500" : "text-gray-400"
                )}
              />
              <p className="mb-2 text-lg font-medium text-gray-700">
                <span className="font-bold">Click to upload</span> or drag and
                drop
              </p>
              <p className="text-sm text-gray-500">PDF only (MAX. 5MB)</p>
              <p className="text-xs text-gray-400 mt-2">
                ✨ Advanced AI parsing for 100% accuracy
              </p>
            </div>
            <input
              id="cv-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={onFileChange}
            />
          </label>

          {file && (
            <div className="flex items-center p-4 border rounded-xl bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <FileText className="w-8 h-8 mr-3 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-gray-800 truncate">
                  {file.name}
                </p>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for
                  processing
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-8 w-8 text-gray-500 hover:text-red-500"
                onClick={() => setFile(null)}
              >
                <span className="sr-only">Remove file</span>
                &times;
              </Button>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleProceed}
              disabled={!file}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Analyze CV with AI
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
