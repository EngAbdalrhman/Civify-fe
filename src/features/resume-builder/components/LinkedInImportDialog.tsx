"use client";

import { useMemo, useState } from "react";
import { Briefcase, Linkedin, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResumeData } from "@/features/upload-cv/types";
import {
  LinkedInImportReview,
  LinkedInImportSelection,
} from "@/features/resume-builder/types";
import {
  mergeLinkedInImport,
  parseLinkedInImport,
} from "@/features/resume-builder/utils/linkedinImport";

interface LinkedInImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentResume: ResumeData;
  onImport: (data: ResumeData) => void;
}

const DEFAULT_SELECTION: LinkedInImportSelection = {
  personalInfo: true,
  summary: true,
  experience: true,
  education: true,
  skills: true,
  certifications: true,
  projects: true,
};

export function LinkedInImportDialog({
  open,
  onOpenChange,
  currentResume,
  onImport,
}: LinkedInImportDialogProps) {
  const t = useTranslations("builder.linkedinImport");
  const tr = (
    key: string,
    fallback: string,
    values?: Record<string, string | number>,
  ) => {
    if (!t.has(key as never)) {
      return fallback;
    }

    return values ? t(key as never, values as never) : t(key as never);
  };
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [review, setReview] = useState<LinkedInImportReview | null>(null);
  const [selection, setSelection] =
    useState<LinkedInImportSelection>(DEFAULT_SELECTION);
  const [mergeMode, setMergeMode] = useState<"append" | "replace">("append");

  const importCounts = useMemo(() => {
    if (!review) return null;

    return review.parsedResume.sections.reduce(
      (acc, section) => {
        acc[section.type] = section.items.length;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [review]);

  const resetState = () => {
    setSourceUrl("");
    setSourceText("");
    setReview(null);
    setSelection(DEFAULT_SELECTION);
    setMergeMode("append");
  };

  const handleParse = () => {
    if (!sourceText.trim()) {
      toast.error(tr("errors.empty", "Paste LinkedIn profile text before continuing"));
      return;
    }

    const parsedResume = parseLinkedInImport(sourceText, sourceUrl);
    setReview({
      sourceUrl,
      sourceText,
      parsedResume,
    });
  };

  const handleApplyImport = () => {
    if (!review) return;
    const merged = mergeLinkedInImport(
      currentResume,
      review.parsedResume,
      selection,
      mergeMode,
    );
    onImport(merged);
    toast.success(tr("success", "LinkedIn content merged into the builder"));
    resetState();
    onOpenChange(false);
  };

  const toggleSelection = (key: keyof LinkedInImportSelection, checked: boolean) => {
    setSelection((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetState();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-[#0A66C2]" />
            {tr("title", "Import From LinkedIn")}
          </DialogTitle>
          <DialogDescription>
            {tr(
              "description",
              "Paste LinkedIn profile text, review the parsed content, and choose exactly what to merge into the builder.",
            )}
          </DialogDescription>
        </DialogHeader>

        {!review ? (
          <div className="space-y-5 py-2">
            <Card className="border-dashed">
              <CardContent className="flex gap-3 p-4">
                <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {tr("howItWorksTitle", "How it works")}
                  </p>
                  <p>
                    {tr(
                      "howItWorksBody",
                      "Paste your profile text from LinkedIn. Civify will build a draft resume and let you review each section before merging it.",
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="linkedin-url">
                {tr("profileUrl", "LinkedIn Profile URL")}
              </Label>
              <Input
                id="linkedin-url"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder={tr(
                  "profileUrlPlaceholder",
                  "https://linkedin.com/in/username",
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin-text">
                {tr("profileText", "LinkedIn Profile Text")}
              </Label>
              <Textarea
                id="linkedin-text"
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                placeholder={tr(
                  "profileTextPlaceholder",
                  "Paste your LinkedIn profile text here...",
                )}
                className="min-h-[260px]"
              />
              <p className="text-xs text-muted-foreground">
                {tr(
                  "hint",
                  "Tip: copy your profile page content including About, Experience, Education, and Skills.",
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">
                      {tr("reviewTitle", "Review Parsed Content")}
                    </h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {tr("preview.fullName", "Full name")}
                      </p>
                      <p className="font-medium">
                        {review.parsedResume.personalInfo.fullName || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {tr("preview.jobTitle", "Headline")}
                      </p>
                      <p className="font-medium">
                        {review.parsedResume.personalInfo.jobTitle || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {tr("preview.email", "Email")}
                      </p>
                      <p className="font-medium break-all">
                        {review.parsedResume.personalInfo.email || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {tr("preview.linkedin", "LinkedIn")}
                      </p>
                      <p className="font-medium break-all">
                        {review.parsedResume.personalInfo.linkedin || review.sourceUrl || "—"}
                      </p>
                    </div>
                  </div>

                  {review.parsedResume.personalInfo.summary ? (
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                        {tr("preview.summary", "Summary")}
                      </p>
                      <p className="line-clamp-5 text-sm text-muted-foreground">
                        {review.parsedResume.personalInfo.summary}
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">
                      {tr("foundSections", "Imported Sections")}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {tr("badges.experience", `${importCounts?.experience || 0} experience`, {
                        count: importCounts?.experience || 0,
                      })}
                    </Badge>
                    <Badge variant="secondary">
                      {tr("badges.education", `${importCounts?.education || 0} education`, {
                        count: importCounts?.education || 0,
                      })}
                    </Badge>
                    <Badge variant="secondary">
                      {tr("badges.skills", `${importCounts?.skills || 0} skills`, {
                        count: importCounts?.skills || 0,
                      })}
                    </Badge>
                    <Badge variant="secondary">
                      {tr(
                        "badges.certifications",
                        `${importCounts?.certifications || 0} certifications`,
                        {
                          count: importCounts?.certifications || 0,
                        },
                      )}
                    </Badge>
                    <Badge variant="secondary">
                      {tr("badges.projects", `${importCounts?.projects || 0} projects`, {
                        count: importCounts?.projects || 0,
                      })}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {tr("mergeModeTitle", "How should we merge it?")}
                  </h3>
                  <div className="inline-flex rounded-lg bg-muted p-1">
                    <Button
                      type="button"
                      variant={mergeMode === "append" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setMergeMode("append")}
                    >
                      {tr("mergeMode.append", "Append")}
                    </Button>
                    <Button
                      type="button"
                      variant={mergeMode === "replace" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setMergeMode("replace")}
                    >
                      {tr("mergeMode.replace", "Replace")}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["personalInfo", tr("fields.personalInfo", "Personal info")],
                      ["summary", tr("fields.summary", "Summary")],
                      ["experience", tr("fields.experience", "Experience")],
                      ["education", tr("fields.education", "Education")],
                      ["skills", tr("fields.skills", "Skills")],
                      ["certifications", tr("fields.certifications", "Certifications")],
                      ["projects", tr("fields.projects", "Projects")],
                    ] as Array<[keyof LinkedInImportSelection, string]>
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40"
                    >
                      <Checkbox
                        checked={selection[key]}
                        onCheckedChange={(checked) =>
                          toggleSelection(key, checked === true)
                        }
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          {review ? (
            <>
              <Button variant="outline" onClick={() => setReview(null)}>
                {tr("back", "Back")}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {tr("cancel", "Cancel")}
              </Button>
              <Button onClick={handleApplyImport}>
                {tr("apply", "Apply Import")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {tr("cancel", "Cancel")}
              </Button>
              <Button onClick={handleParse}>{tr("parse", "Parse Profile")}</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
