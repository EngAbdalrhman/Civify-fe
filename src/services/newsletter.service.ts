import apiClient from '@/api/client';

export const newsletterService = {
  subscribe: async (email: string) => {
    const response = await apiClient.post('/v1/newsletter/subscribe', { email });
    return response.data;
  },
  
  unsubscribe: async (email: string) => {
    const response = await apiClient.post('/v1/newsletter/unsubscribe', { email });
    return response.data;
  },

  broadcast: async (data: { subject: string; content: string; isHtml?: boolean }) => {
    const response = await apiClient.post('/v1/newsletter/broadcast', data);
    return response.data;
  }
};
