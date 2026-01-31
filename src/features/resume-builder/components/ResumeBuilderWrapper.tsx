import { ResumeBuilder } from "@/components/resume-builder/ResumeBuilder";
import { ResumeData, emptyResumeData } from "@/features/upload-cv/types";

interface ResumeBuilderWrapperProps {
  initialData: ResumeData | null;
  resumeId: string | null;
  isGuest: boolean;
}

export function ResumeBuilderWrapper({
  initialData,
  resumeId,
  isGuest,
}: ResumeBuilderWrapperProps) {
  return (
    <div className="min-h-screen bg-background">
      <ResumeBuilder
        initialData={initialData || emptyResumeData}
        resumeId={resumeId}
        isGuest={isGuest}
      />
    </div>
  );
}
