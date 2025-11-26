'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Resume, ResumeData, initialResumeData } from '@/types/resume';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface ResumeContextType {
  resume: Resume | null;
  resumeData: ResumeData;
  isLoading: boolean;
  isSaving: boolean;
  updateResumeData: (data: Partial<ResumeData>) => void;
  updateSection: (sectionId: string, data: any) => void;
  addSection: (type: string) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  saveResume: () => Promise<void>;
  loadResume: (id: string) => Promise<void>;
  createResume: (title: string) => Promise<string>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const updateResumeData = useCallback((newData: Partial<ResumeData>) => {
    setResumeData((prev) => ({ ...prev, ...newData }));
  }, []);

  const updateSection = useCallback((sectionId: string, data: any) => {
    setResumeData((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, ...data } : sec
      ),
    }));
  }, []);

  const addSection = useCallback((type: string) => {
    setResumeData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `sec-${Date.now()}`,
          title: type.charAt(0).toUpperCase() + type.slice(1),
          type: type as any,
          items: [],
          isVisible: true,
          order: prev.sections.length + 1,
        },
      ],
    }));
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    setResumeData((prev) => ({
      ...prev,
      sections: prev.sections.filter((sec) => sec.id !== sectionId),
    }));
  }, []);

  const reorderSections = useCallback((startIndex: number, endIndex: number) => {
    setResumeData((prev) => {
      const result = Array.from(prev.sections);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, sections: result };
    });
  }, []);

  const saveResume = useCallback(async () => {
    if (!resume) return;
    setIsSaving(true);
    try {
      // Assuming backend API is at /api/resumes
      // We need to use the full URL if it's on a different port, but for now assuming proxy or same origin
      // Or using the environment variable for API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      await axios.put(`${apiUrl}/api/resumes/${resume.id}`, {
        title: resume.title,
        data: resumeData,
      }, {
        withCredentials: true // Important for session/cookie auth
      });
      toast({ title: 'Saved', description: 'Resume saved successfully.' });
    } catch (error: any) {
      console.error('Error saving resume:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      toast({ title: 'Error', description: `Failed to save resume: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [resume, resumeData, toast]);

  const loadResume = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await axios.get(`${apiUrl}/api/resumes/${id}`, {
         withCredentials: true
      });
      setResume(response.data);
      setResumeData(response.data.data || initialResumeData);
    } catch (error) {
      console.error('Error loading resume:', error);
      toast({ title: 'Error', description: 'Failed to load resume.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createResume = useCallback(async (title: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await axios.post(`${apiUrl}/api/resumes`, {
        title,
        data: initialResumeData,
      }, {
         withCredentials: true
      });
      setResume(response.data);
      setResumeData(response.data.data);
      return response.data.id;
    } catch (error) {
      console.error('Error creating resume:', error);
      toast({ title: 'Error', description: 'Failed to create resume.', variant: 'destructive' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return (
    <ResumeContext.Provider
      value={{
        resume,
        resumeData,
        isLoading,
        isSaving,
        updateResumeData,
        updateSection,
        addSection,
        removeSection,
        reorderSections,
        saveResume,
        loadResume,
        createResume,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};
