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
import { AlertCircle, CheckCircle2, Target, Loader2, LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface AtsScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: AtsScore | null;
  isLoading: boolean;
  onApplyAtsTemplate?: () => void;
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

export function AtsScoreDialog({
  open,
  onOpenChange,
  score,
  isLoading,
  onApplyAtsTemplate,
}: AtsScoreDialogProps) {
  const t = useTranslations('atsScore');

  const contentScore = score?.contentScore ?? score?.keywordMatch ?? 0;
  const formatScore = score?.formatScore;
  const parseScore = score?.parseabilityScore;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
            <div className="text-center space-y-2">
              <div className={cn("text-6xl font-bold", getScoreColor(score.overall))}>
                {score.overall}%
              </div>
              <p className="text-muted-foreground">{t('overallCompatibility')}</p>
              {score.atsReadiness && (
                <p className="text-sm text-muted-foreground">
                  {t('atsReadiness')}: {t(`readiness.${score.atsReadiness}`)}
                </p>
              )}
            </div>

            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", getScoreBarColor(score.overall))}
                style={{ width: `${Math.min(100, Math.max(0, score.overall))}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">{t('contentQuality')}</p>
                <p className="font-semibold text-lg">{contentScore}%</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">{t('structureScore')}</p>
                <p className="font-semibold text-lg">{score.skillsMatch}%</p>
              </div>
              {formatScore != null && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">{t('formatScore')}</p>
                  <p className="font-semibold text-lg">{formatScore}%</p>
                </div>
              )}
              {parseScore != null && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">{t('parseabilityScore')}</p>
                  <p className="font-semibold text-lg">{parseScore}%</p>
                </div>
              )}
            </div>

            {score.recommendedTemplateId && score.recommendedTemplateId !== 'ats' && onApplyAtsTemplate && (
              <Button variant="outline" className="w-full gap-2" onClick={onApplyAtsTemplate}>
                <LayoutTemplate className="h-4 w-4" />
                {t('applyAtsTemplate')}
              </Button>
            )}

            {score.formatIssues && score.formatIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  {t('formatIssues')}
                </h4>
                <ul className="text-sm space-y-2">
                  {score.formatIssues.slice(0, 5).map((issue, idx) => (
                    <li key={idx} className="text-muted-foreground">
                      <span className="font-medium text-foreground">{issue.message}</span>
                      {issue.fixHint && (
                        <span className="block text-xs mt-0.5">{issue.fixHint}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
