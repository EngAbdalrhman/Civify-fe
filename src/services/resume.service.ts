import apiClient from '@/api/client';
import { ResumeData } from '@/features/upload-cv/types';

export interface ResumeSummary {
  id: string;
  title: string;
  updatedAt: string;
  data: ResumeData;
}

export const ResumeService = {
  getAll: async (): Promise<ResumeSummary[]> => {
    const response = await apiClient.get<ResumeSummary[]>('/resumes');
    return response.data;
  },

  getById: async (id: string): Promise<ResumeSummary> => {
    const response = await apiClient.get<ResumeSummary>(`/resumes/${id}`);
    return response.data;
  },

  create: async (title: string, data: ResumeData): Promise<ResumeSummary> => {
    const response = await apiClient.post<ResumeSummary>('/resumes', { title, data });
    return response.data;
  },

  update: async (id: string, title: string, data: ResumeData): Promise<ResumeSummary> => {
    const response = await apiClient.put<ResumeSummary>(`/resumes/${id}`, { title, data });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/resumes/${id}`);
  }
};
