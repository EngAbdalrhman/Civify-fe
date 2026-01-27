import apiClient from '@/api/client';
import { ResumeData, AtsScore } from '@/features/upload-cv/types';

export interface ResumeSummary {
  id: string;
  title: string;
  updatedAt: string;
  data: ResumeData;
}

interface CommonResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const ResumeService = {
  getAll: async (): Promise<ResumeSummary[]> => {
    const response = await apiClient.get<ResumeSummary[]>('/v1/resumes');
    return response.data;
  },

  getById: async (id: string): Promise<ResumeSummary> => {
    const response = await apiClient.get<ResumeSummary>(`/v1/resumes/${id}`);
    return response.data;
  },

  create: async (title: string, data: ResumeData): Promise<ResumeSummary> => {
    const response = await apiClient.post<ResumeSummary>('/v1/resumes', { title, data });
    return response.data;
  },

  update: async (id: string, title: string, data: ResumeData): Promise<ResumeSummary> => {
    const response = await apiClient.put<ResumeSummary>(`/v1/resumes/${id}`, { title, data });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/resumes/${id}`);
  },

  calculateScore: async (resumeData: ResumeData): Promise<AtsScore> => {
    const response = await apiClient.post<CommonResponse<AtsScore>>('/v1/cvs/score', { resumeData });
    return response.data.data;
  }
};
