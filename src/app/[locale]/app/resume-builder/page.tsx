"use client";

import { Suspense } from "react";
import { ResumeBuilderContent } from "@/features/resume-builder/components/ResumeBuilderContent";
import { ResumeBuilderFallback } from "@/features/resume-builder/components/ResumeBuilderFallback";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

export default function ResumeBuilderPage() {
  return (
    <RouteErrorBoundary routeName="Resume Builder">
      <Suspense fallback={<ResumeBuilderFallback />}>
        <ResumeBuilderContent />
      </Suspense>
    </RouteErrorBoundary>
  );
}
