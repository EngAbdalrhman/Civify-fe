'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Resume, ResumeData, initialResumeData } from '@/types/resume';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

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
      
      // Update order property for all sections
      const updatedSections = result.map((section, index) => ({
        ...section,
        order: index + 1
      }));
      
      return { ...prev, sections: updatedSections };
    });
  }, []);

  const router = useRouter();

  const saveResume = useCallback(async () => {
    console.log('Attempting to save resume...');
    setIsSaving(true);
    try {
      if (resume) {
        // Update existing resume
        console.log('Updating resume with ID:', resume.id);
        await apiClient.put(`/v1/resumes/${resume.id}`, {
          title: resume.title,
          data: resumeData,
        });
        toast({ title: 'Saved', description: 'Resume saved successfully.' });
      } else {
        // Create new resume
        console.log('Creating new resume...');
        const title = resumeData.personalInfo.fullName || 'Untitled Resume';
        const response = await apiClient.post(`/v1/resumes`, {
          title,
          data: resumeData,
        });
        
        setResume(response);
        // Optionally update URL to the new ID
        if (response.id) {
            router.push(`/resume/builder/${response.id}`);
        }
        toast({ title: 'Saved', description: 'Resume created successfully.' });
      }
    } catch (error: any) {
      console.error('Error saving resume:', error);
      toast({ title: 'Error', description: `Failed to save resume: ${error?.message || 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [resume, resumeData, toast, router]);

  const loadResume = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/v1/resumes/${id}`);
      setResume(response);
      setResumeData(response.data || initialResumeData);
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
      const response = await apiClient.post(`/v1/resumes`, {
        title,
        data: initialResumeData,
      });
      setResume(response);
      setResumeData(response.data);
      return response.id;
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
