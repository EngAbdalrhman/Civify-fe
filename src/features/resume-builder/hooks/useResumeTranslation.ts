import { useState, useEffect } from 'react';
import { ResumeData } from '@/features/upload-cv/types';
import { ResumeService } from '@/services/resume.service';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export type TranslateSaveMode = 'new' | 'replace';

export function useResumeTranslation(
  resumeData: ResumeData,
  onTranslateComplete: (translatedData: ResumeData, saveMode: TranslateSaveMode, targetLang: string) => void
) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslateDialog, setShowTranslateDialog] = useState(false);
  const [translateSaveMode, setTranslateSaveMode] = useState<TranslateSaveMode>('new');
  const t = useTranslations('builder.translate');

  // Load preference from local storage
  useEffect(() => {
    const savedPref = localStorage.getItem('translateSaveMode') as TranslateSaveMode;
    if (savedPref && (savedPref === 'new' || savedPref === 'replace')) {
      setTranslateSaveMode(savedPref);
    }
  }, []);

  const handleSaveModeChange = (mode: TranslateSaveMode) => {
    setTranslateSaveMode(mode);
    localStorage.setItem('translateSaveMode', mode);
  };

  const handleTranslate = async (targetLanguage: string) => {
    try {
      setIsTranslating(true);
      
      const response = await ResumeService.translate(resumeData, targetLanguage);
      
      onTranslateComplete(response.translatedCv, translateSaveMode, targetLanguage);
      
      // toast.success(t('success', { language: t(`languages.${targetLanguage}`) }));
      setShowTranslateDialog(false);
    } catch (error) {
      console.error('Translation failed:', error);
      toast.error(t('error'));
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    isTranslating,
    showTranslateDialog,
    setShowTranslateDialog,
    translateSaveMode,
    handleSaveModeChange,
    handleTranslate
  };
}
