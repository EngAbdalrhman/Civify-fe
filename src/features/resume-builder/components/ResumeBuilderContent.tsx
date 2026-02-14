"use client";

import { useResumeData } from "../hooks/useResumeData";
import { LoadingSpinner } from "./LoadingSpinner";
import { ResumeBuilder } from "./ResumeBuilder";
import { emptyResumeData } from "@/features/upload-cv/types";

export function ResumeBuilderContent() {
  const { initialData, resumeId, isLoading } = useResumeData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <ResumeBuilder
        initialData={initialData || emptyResumeData}
        resumeId={resumeId}
      />
    </div>
  );
}
