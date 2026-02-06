import apiClient from '@/api/client';

export interface JobApplicationRequest {
  cvId?: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  tailoredCV?: string;
  coverLetter?: string;
  applicationStatus?: string;
  notes?: string;
}

export interface JobApplication {
  id: number;
  jobTitle: string;
  company: string;
  jobDescription: string;
  tailoredCV?: string;
  coverLetter?: string;
  applicationStatus: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const JobApplicationService = {
  getAll: async (): Promise<JobApplication[]> => {
    const response = await apiClient.get<JobApplication[]>('/v1/job-applications');
    return response.data;
  },

  getById: async (id: number): Promise<JobApplication> => {
    const response = await apiClient.get<JobApplication>(`/v1/job-applications/${id}`);
    return response.data;
  },

  create: async (data: JobApplicationRequest): Promise<JobApplication> => {
    const response = await apiClient.post<JobApplication>('/v1/job-applications', data);
    return response.data;
  },

  update: async (id: number, data: Partial<JobApplicationRequest>): Promise<JobApplication> => {
    const response = await apiClient.patch<JobApplication>(`/v1/job-applications/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/job-applications/${id}`);
  },

  scrapeJd: async (url: string): Promise<string> => {
    const response = await apiClient.post<{ content: string }>('/v1/job-applications/scrape-jd', { url });
    return response.data.content;
  }
};
