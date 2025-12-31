"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ResumeBuilder } from '@/components/resume-builder/ResumeBuilder';
import { ResumeData, emptyResumeData } from '@/features/upload-cv/types';
import { ResumeService } from '@/services/resume.service';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const STORAGE_KEY = 'civify_guest_resume';

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');
  
  const [initialData, setInitialData] = useState<ResumeData | null>(null);
  const [resumeIdState, setResumeIdState] = useState<string | null>(resumeId);
  const [isLoading, setIsLoading] = useState(true);
  const [showCachePrompt, setShowCachePrompt] = useState(false);
  const [cachedData, setCachedData] = useState<ResumeData | null>(null);

  const isGuest = !user || !user.id;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Priority 1: If resumeId is provided, fetch from API
        if (resumeId && !isGuest) {
          try {
            const resume = await ResumeService.getById(resumeId);
            const dataWithId = { ...resume.data, id: resume.id };
            setInitialData(dataWithId);
            setResumeIdState(resume.id);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error("Failed to load resume from API", error);
            toast.error("Failed to load resume. Starting fresh.");
          }
        }

        // Priority 2: Check for cached guest data
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            // If there's cached data but we're not editing a specific resume, ask user
            if (!resumeId) {
              setCachedData(parsed);
              setShowCachePrompt(true);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error("Failed to parse cached resume", e);
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        // Priority 3: Start fresh
        setInitialData(emptyResumeData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [resumeId, isGuest]);

  const handleContinueCached = () => {
    if (cachedData) {
      setInitialData(cachedData);
    }
    setShowCachePrompt(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(STORAGE_KEY);
    setInitialData(emptyResumeData);
    setShowCachePrompt(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show cache prompt dialog
  if (showCachePrompt && !initialData) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <AlertDialog open={showCachePrompt} onOpenChange={setShowCachePrompt}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resume in Progress Found</AlertDialogTitle>
              <AlertDialogDescription>
                You have an unsaved resume from a previous session. Would you like to continue editing it or start fresh?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleStartFresh}>Start Fresh</AlertDialogCancel>
              <AlertDialogAction onClick={handleContinueCached}>Continue Editing</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ResumeBuilder 
        initialData={initialData || emptyResumeData}
        resumeId={resumeIdState}
        isGuest={isGuest} 
      />
    </div>
  );
}
