'use client';
import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from './Loader';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import {extractTextFromPdf} from "@/lib/pdf";

interface Step1UploadProps {
  nextStep: () => void;
  updateFormData: (data: { cvFileName: string; rawCvText: string }) => void;
}

export default function Step1Upload({ nextStep, updateFormData }: Step1UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
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
        const text = await extractTextFromPdf(file);
        updateFormData({
          cvFileName: file.name,
          rawCvText: text,
        });
        nextStep();
      } catch (error) {
        toast({
          title: "PDF Parsing Error",
          description: "Could not extract text from the PDF. Please ensure it's a valid, text-based PDF and try again.",
          variant: "destructive",
        });
      } finally {
        setIsParsing(false);
      }
    }
  };

  if (isParsing) {
    return (
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-12">
          <Loader message="Analyzing your CV..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-2xl animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Upload Your CV</CardTitle>
        <CardDescription>Begin by uploading your CV in PDF format. We'll extract the text to get started.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-6">
          <label 
            htmlFor="cv-upload" 
            className={cn(
              "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
              isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-accent/50"
            )}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PDF only (MAX. 5MB)</p>
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
            <div className="flex items-center p-3 border rounded-lg bg-secondary/50">
              <FileText className="w-6 h-6 mr-3 text-primary" />
              <span className="font-medium text-sm truncate">{file.name}</span>
              <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setFile(null)}>
                <span className="sr-only">Remove file</span>
                &times;
              </Button>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleProceed} disabled={!file} size="lg">
              Proceed
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
