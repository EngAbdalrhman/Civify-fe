import apiClient from '@/api/client';
import { ResumeData } from "@/features/upload-cv/types";

export interface JobMatchRequest {
    resumeData: ResumeData;
    jobDescription?: string;
    jobUrl?: string;
}

export interface SkillMatch {
    skill: string;
    cvEvidence: string;
    confidence: number;
}

export interface SkillGap {
    skill: string;
    required: boolean;
    suggestion: string;
}

export interface JobMatchSuggestion {
    section: string;
    action: string;
    reason: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface AtsScore {
    overall: number;
    keywordMatch: number;
    skillsMatch: number;
    missingKeywords: string[];
    suggestions: string[];
}

export interface JobMatchResult {
    overallScore: number;
    skillsScore: number;
    experienceScore: number;
    keywordScore: number;
    
    parsedJd: {
        jobTitle: string;
        companyName: string;
        seniority: string;
        remotePolicy: string;
        location: string;
        requiredSkills: string[];
        preferredSkills: string[];
        responsibilities: string[];
        minExperienceYears: number;
        domain: string;
    };
    
    matchedSkills: SkillMatch[];
    missingSkills: SkillGap[];
    matchedExperience: string[];
    
    suggestions: JobMatchSuggestion[];
    atsScore: AtsScore;
    
    processingTimeMs: number;
    totalTokensUsed: number;
}

// CommonResponse wrapper matching backend's CommonResponse<T>
interface CommonResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface JobMatchAnalytics {
  totalAnalyses: number;
  averageScore: number;
  strongestArea: string;
  weakestArea: string;
  topMissingSkills: string[];
  recentTrends: {
    targetJobTitle: string;
    atsScore: number;
    analyzedAt: string;
  }[];
}

export const jobMatchService = {
    async analyzeMatch(request: JobMatchRequest): Promise<JobMatchResult> {
        const response = await apiClient.post<CommonResponse<JobMatchResult>>("/v1/job-match/analyze", request);
        return response.data.data;
    },
    async getHistory(page = 0, size = 10): Promise<{ content: any[], totalElements: number }> {
        const response = await apiClient.get<CommonResponse<any>>("/v1/job-match/history", {
            params: { page, size, sort: 'analyzedAt,desc' }
        });
        return response.data.data;
    },
    async tailorResume(request: import('@/features/upload-cv/types').CvTailorRequest): Promise<import('@/features/upload-cv/types').CvTailorResponse> {
        const response = await apiClient.post<CommonResponse<import('@/features/upload-cv/types').CvTailorResponse>>(
            "/v1/cvs/tailor", request, { timeout: 180000 }
        );
        return response.data.data;
    },
    async getAnalytics(): Promise<JobMatchAnalytics> {
        const response = await apiClient.get<CommonResponse<JobMatchAnalytics>>("/v1/job-match/analytics");
        return response.data.data;
    }
};
