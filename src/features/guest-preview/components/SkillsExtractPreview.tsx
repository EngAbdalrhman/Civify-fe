"use client";

import { Check, X } from "lucide-react";
import { ExtractedSkills } from "../types";

interface SkillsExtractPreviewProps {
  skills: ExtractedSkills;
}

export function SkillsExtractPreview({ skills }: SkillsExtractPreviewProps) {
  return (
    <div className="space-y-4">
      {/* Matched Skills */}
      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          Matched Skills ({skills.matched.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {skills.matched.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300"
            >
              <Check className="mr-1 h-3 w-3" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Skills */}
      {skills.missing.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
            <X className="h-4 w-4" />
            Missing Skills ({skills.missing.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.missing.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300"
              >
                <X className="mr-1 h-3 w-3" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Required & Preferred Breakdown */}
      <div className="mt-4 rounded-lg border bg-muted/50 p-4">
        <h4 className="mb-2 text-sm font-medium">Job Requirements</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Required Skills</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {skills.required.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="rounded bg-primary/10 px-2 py-0.5 text-xs"
                >
                  {skill}
                </span>
              ))}
              {skills.required.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{skills.required.length - 5} more
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nice to Have</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {skills.preferred.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded bg-muted px-2 py-0.5 text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
