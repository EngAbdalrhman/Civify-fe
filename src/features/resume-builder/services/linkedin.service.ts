import apiClient from "@/api/client";
import { ResumeData } from "@/features/upload-cv/types";

// Matches backend CommonResponse<T>
interface CommonResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface LinkedInParseResponse {
    resumeData: ResumeData;
    detectedName: string;
    detectedHeadline: string;
    experienceCount: number;
    educationCount: number;
    skillsCount: number;
    success: boolean;
    errorMessage?: string;
}

export const linkedInService = {
    async parseProfile(profileText: string): Promise<LinkedInParseResponse> {
        try {
            const response = await apiClient.post<CommonResponse<LinkedInParseResponse>>(
                "/v1/linkedin/parse-profile", 
                { profileText }, 
                { timeout: 60000 } // AI parsing can take a bit longer
            );
            return response.data.data;
        } catch (error) {
            console.error("Failed to parse LinkedIn Profile", error);
            throw error;
        }
    }
};
