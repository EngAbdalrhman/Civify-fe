import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { CVData } from '@/lib/types';

export class CvService {
  /**
   * Get all CVs
   */
  async getAllCVs(): Promise<CVData[]> {
    return await apiClient.get<CVData[]>(API_ENDPOINTS.CVS.LIST);
  }

  /**
   * Get CV by ID
   */
  async getCV(id: string): Promise<CVData> {
    return await apiClient.get<CVData>(`${API_ENDPOINTS.CVS.BASE}/${id}`);
  }

  /**
   * Create CV
   */
  async createCV(data: Partial<CVData>): Promise<CVData> {
    return await apiClient.post<CVData>(API_ENDPOINTS.CVS.BASE, data);
  }

  /**
   * Delete CV
   */
  async deleteCV(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.CVS.BASE}/${id}`);
  }
  
  /**
   * Update CV
   */
  async updateCV(id: string, data: Partial<CVData>): Promise<CVData> {
      return await apiClient.patch<CVData>(`${API_ENDPOINTS.CVS.BASE}/${id}`, data);
  }
}

export const cvService = new CvService();
