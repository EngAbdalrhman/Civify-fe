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

export const jobMatchService = {
    async analyzeMatch(request: JobMatchRequest): Promise<JobMatchResult> {
        const response = await apiClient.post<CommonResponse<JobMatchResult>>("/v1/job-match/analyze", request);
        return response.data.data;
    }
};
