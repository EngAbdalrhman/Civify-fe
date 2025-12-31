"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ResumeBuilder } from '@/components/resume-builder/ResumeBuilder';
import { ResumeData, emptyResumeData } from '@/features/upload-cv/types';
import { toast } from 'sonner';

const STORAGE_KEY = 'civify_guest_resume';

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const [initialData, setInitialData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data strategy:
    // 1. If authenticated and visited via "Edit", we might pass data via props/context (handled by parent or dashboard)
    // 2. For now, we focus on the "Builder" independence.
    // 3. Check localStorage for guest progress
    
    const loadData = async () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setInitialData(parsed);
          } catch (e) {
            console.error("Failed to parse saved resume", e);
            setInitialData(emptyResumeData);
          }
        } else {
          setInitialData(emptyResumeData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine if guest based on user existence (which checks permissions internally)
  const isGuest = !user || !user.id;

  return (
    <div className="min-h-screen bg-background">
      <ResumeBuilder 
        initialData={initialData || emptyResumeData} 
        isGuest={isGuest} 
      />
    </div>
  );
}
