"use client";

import { AtsScore } from '@/features/upload-cv/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Target, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface AtsScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: AtsScore | null;
  isLoading: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function AtsScoreDialog({ open, onOpenChange, score, isLoading }: AtsScoreDialogProps) {
  const t = useTranslations('atsScore');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('analyzing')}</p>
          </div>
        ) : score ? (
          <div className="space-y-6 py-4">
            {/* Main Score */}
            <div className="text-center space-y-2">
              <div className={cn("text-6xl font-bold", getScoreColor(score.overall))}>
                {score.overall}%
              </div>
              <p className="text-muted-foreground">{t('overallCompatibility')}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", getScoreBarColor(score.overall))}
                style={{ width: `${score.overall}%` }}
              />
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">{t('contentQuality')}</p>
                <p className="font-semibold text-lg">{score.keywordMatch}%</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">{t('skillsPresentation')}</p>
                <p className="font-semibold text-lg">{score.skillsMatch}%</p>
              </div>
            </div>

            {/* Missing Elements */}
            {score.missingKeywords && score.missingKeywords.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  {t('areasToImprove')}
                </h4>
                <ul className="text-sm space-y-1">
                  {score.missingKeywords.slice(0, 5).map((item, idx) => (
                    <li key={idx} className="text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {score.suggestions && score.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('suggestions')}
                </h4>
                <ul className="text-sm space-y-1">
                  {score.suggestions.slice(0, 5).map((suggestion, idx) => (
                    <li key={idx} className="text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button className="w-full" onClick={() => onOpenChange(false)}>
              {t('close')}
            </Button>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            {t('noScore')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

