import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { JobApplication } from '@/lib/types';

export class JobApplicationService {
  /**
   * Get all job applications
   */
  async getAllApplications(): Promise<JobApplication[]> {
    return await apiClient.get<JobApplication[]>(API_ENDPOINTS.JOB_APPLICATIONS.LIST);
  }

  /**
   * Get job application by ID
   */
  async getApplication(id: string): Promise<JobApplication> {
    return await apiClient.get<JobApplication>(`${API_ENDPOINTS.JOB_APPLICATIONS.BASE}/${id}`);
  }

  /**
   * Create job application
   */
  async createApplication(data: Partial<JobApplication>): Promise<JobApplication> {
    return await apiClient.post<JobApplication>(API_ENDPOINTS.JOB_APPLICATIONS.BASE, data);
  }

  /**
   * Update job application
   */
  async updateApplication(id: string, data: Partial<JobApplication>): Promise<JobApplication> {
    return await apiClient.patch<JobApplication>(`${API_ENDPOINTS.JOB_APPLICATIONS.BASE}/${id}`, data);
  }

  /**
   * Delete job application
   */
  async deleteApplication(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.JOB_APPLICATIONS.BASE}/${id}`);
  }
}

export const jobApplicationService = new JobApplicationService();
