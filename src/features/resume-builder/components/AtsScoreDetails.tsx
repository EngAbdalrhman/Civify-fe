"use client";

import { AtsScore } from "@/features/upload-cv/types";

interface AtsScoreDetailsProps {
  score: AtsScore;
  className?: string;
}

/** Inline breakdown for tailor / job-match (not a separate dialog). */
export function AtsScoreDetails({ score, className = "" }: AtsScoreDetailsProps) {
  const hasFormat =
    score.formatScore != null ||
    score.parseabilityScore != null ||
    (score.formatIssues && score.formatIssues.length > 0);

  if (!hasFormat && score.keywordMatch == null) {
    return null;
  }

  return (
    <div className={`space-y-3 text-sm ${className}`}>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md bg-muted/50 px-2 py-1.5">
          <p className="text-xs text-muted-foreground">Keywords</p>
          <p className="font-semibold">{score.keywordMatch}%</p>
        </div>
        <div className="rounded-md bg-muted/50 px-2 py-1.5">
          <p className="text-xs text-muted-foreground">Skills fit</p>
          <p className="font-semibold">{score.skillsMatch}%</p>
        </div>
        {score.formatScore != null && (
          <div className="rounded-md bg-muted/50 px-2 py-1.5">
            <p className="text-xs text-muted-foreground">Format</p>
            <p className="font-semibold">{score.formatScore}%</p>
          </div>
        )}
        {score.atsReadiness && (
          <div className="rounded-md bg-muted/50 px-2 py-1.5">
            <p className="text-xs text-muted-foreground">Layout</p>
            <p className="font-semibold capitalize">{score.atsReadiness}</p>
          </div>
        )}
      </div>

      {score.formatIssues && score.formatIssues.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-2.5">
          <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">
            Format notes (affects ATS parsing)
          </p>
          <ul className="text-xs text-amber-800 dark:text-amber-300/90 space-y-0.5">
            {score.formatIssues.slice(0, 4).map((issue, i) => (
              <li key={i}>{issue.message}</li>
            ))}
          </ul>
          {score.recommendedTemplateId === "ats" && (
            <p className="text-xs mt-1.5 text-amber-900/80 dark:text-amber-200/80">
              Tip: switch to the ATS Optimized template in Design before exporting.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
