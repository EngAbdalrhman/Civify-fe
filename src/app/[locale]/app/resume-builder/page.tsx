"use client";

import { Suspense } from "react";
import { ResumeBuilderContent } from "@/features/resume-builder/components/ResumeBuilderContent";
import { ResumeBuilderFallback } from "@/features/resume-builder/components/ResumeBuilderFallback";

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={<ResumeBuilderFallback />}>
      <ResumeBuilderContent />
    </Suspense>
  );
}
