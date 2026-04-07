"use client";

import { CvTailorResponse } from "@/features/upload-cv/types";

export type BuilderSaveStatus = "saved" | "saving" | "unsaved" | "error";

export interface TargetJobState {
  jobTitle: string;
  company: string;
  jobDescription: string;
  jobUrl: string;
  lastTailoredAt: string | null;
}

export interface TailoringOptions {
  generateCoverLetter: boolean;
  includeInterviewQuestions: boolean;
  includeRoadmap: boolean;
}

export interface LinkedInImportSelection {
  personalInfo: boolean;
  summary: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  certifications: boolean;
  projects: boolean;
}

export interface LinkedInImportReview {
  sourceUrl: string;
  sourceText: string;
  parsedResume: import("@/features/upload-cv/types").ResumeData;
}

export interface TargetJobResultState {
  response: CvTailorResponse | null;
  savedResumeId: string | null;
}
