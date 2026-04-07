"use client";

import { useMemo } from "react";
import {
  ArrowRight,
  Briefcase,
  Copy,
  FileText,
  Link2,
  Loader2,
  Map,
  MessageSquare,
  Save,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TargetJobResultState, TargetJobState, TailoringOptions } from "@/features/resume-builder/types";

interface TargetJobPanelProps {
  targetJob: TargetJobState;
  options: TailoringOptions;
  result: TargetJobResultState;
  jobDescriptionError: string;
  isScraping: boolean;
  isTailoring: boolean;
  isSavingTailoredResume: boolean;
  onTargetJobChange: (updates: Partial<TargetJobState>) => void;
  onOptionsChange: (updates: Partial<TailoringOptions>) => void;
  onScrapeJobUrl: () => Promise<void>;
  onGenerate: () => void;
  onOpenAtsScore: () => void;
  onApplyTailored: () => void;
  onSaveTailoredDuplicate: () => void;
  onCopyCoverLetter: () => void;
  onDownloadCoverLetter: () => void;
}

function getScoreTone(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

export function TargetJobPanel({
  targetJob,
  options,
  result,
  jobDescriptionError,
  isScraping,
  isTailoring,
  isSavingTailoredResume,
  onTargetJobChange,
  onOptionsChange,
  onScrapeJobUrl,
  onGenerate,
  onOpenAtsScore,
  onApplyTailored,
  onSaveTailoredDuplicate,
  onCopyCoverLetter,
  onDownloadCoverLetter,
}: TargetJobPanelProps) {
  const t = useTranslations("builder.targetJob");
  const tr = (key: string, fallback: string) =>
    t.has(key as never) ? t(key as never) : fallback;

  const tabs = useMemo(() => {
    const available = ["ats"];
    if (result.response?.coverLetter) available.push("cover-letter");
    if ((result.response?.interviewPrep?.questions?.length ?? 0) > 0) {
      available.push("interview");
    }
    if ((result.response?.roadmap?.steps?.length ?? 0) > 0) {
      available.push("roadmap");
    }
    return available;
  }, [result.response]);

  const defaultTab = tabs[0] ?? "ats";
  const score = result.response?.atsScore;
  const beforeScore = result.response?.originalAtsScore;

  return (
    <div className="space-y-6">
      <Card className="border-primary/15 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            {tr("title", "Target a Specific Job")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target-job-title">{tr("jobTitle", "Target Job Title")}</Label>
              <Input
                id="target-job-title"
                value={targetJob.jobTitle}
                onChange={(event) =>
                  onTargetJobChange({ jobTitle: event.target.value })
                }
                placeholder={tr("jobTitlePlaceholder", "e.g. Senior Frontend Engineer")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-company">{tr("company", "Company")}</Label>
              <Input
                id="target-company"
                value={targetJob.company}
                onChange={(event) =>
                  onTargetJobChange({ company: event.target.value })
                }
                placeholder={tr("companyPlaceholder", "e.g. Stripe")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-job-url">{tr("jobUrl", "Job URL")}</Label>
            <div className="flex gap-2">
              <Input
                id="target-job-url"
                value={targetJob.jobUrl}
                onChange={(event) =>
                  onTargetJobChange({ jobUrl: event.target.value })
                }
                placeholder={tr("jobUrlPlaceholder", "Paste a LinkedIn or Indeed job URL")}
              />
              <Button
                variant="outline"
                type="button"
                onClick={onScrapeJobUrl}
                disabled={isScraping || !targetJob.jobUrl.trim()}
                className="gap-2"
              >
                {isScraping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                {tr("importUrl", "Import URL")}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-job-description">{tr("jobDescription", "Job Description")}</Label>
            <Textarea
              id="target-job-description"
              value={targetJob.jobDescription}
              onChange={(event) =>
                onTargetJobChange({ jobDescription: event.target.value })
              }
              placeholder={tr("jobDescriptionPlaceholder", "Paste the full job description here...")}
              className={cn(
                "min-h-[220px]",
                jobDescriptionError && "border-destructive focus-visible:ring-destructive",
              )}
            />
            <div className="flex items-center justify-between text-xs">
              <span className={cn("text-muted-foreground", jobDescriptionError && "text-destructive")}>
                {jobDescriptionError || tr("jobDescriptionHint", "Add at least 50 characters so Civify can tailor accurately.")}
              </span>
              <span className="text-muted-foreground">
                {targetJob.jobDescription.trim().length} / 50
              </span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex items-start gap-3 rounded-xl border p-3">
              <Switch
                checked={options.generateCoverLetter}
                onCheckedChange={(checked) =>
                  onOptionsChange({ generateCoverLetter: checked })
                }
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">{tr("options.coverLetter", "Generate cover letter")}</span>
                <span className="block text-xs text-muted-foreground">
                  {tr("options.coverLetterDesc", "Create a tailored cover letter from the same job context.")}
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border p-3">
              <Switch
                checked={options.includeInterviewQuestions}
                onCheckedChange={(checked) =>
                  onOptionsChange({ includeInterviewQuestions: checked })
                }
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">{tr("options.interviewPrep", "Interview prep")}</span>
                <span className="block text-xs text-muted-foreground">
                  {tr("options.interviewPrepDesc", "Generate likely interview questions from the role and your resume.")}
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border p-3">
              <Switch
                checked={options.includeRoadmap}
                onCheckedChange={(checked) =>
                  onOptionsChange({ includeRoadmap: checked })
                }
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">{tr("options.roadmap", "Learning roadmap")}</span>
                <span className="block text-xs text-muted-foreground">
                  {tr("options.roadmapDesc", "Highlight skill gaps and the next best steps to improve fit.")}
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="gap-2"
              onClick={onGenerate}
              disabled={isTailoring}
            >
              {isTailoring ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isTailoring
                ? tr("actions.generating", "Tailoring...")
                : tr("actions.generate", "Tailor Resume")}
            </Button>
            <Button variant="outline" type="button" className="gap-2" onClick={onOpenAtsScore}>
              <Target className="h-4 w-4" />
              {tr("actions.openAts", "Analyze ATS")}
            </Button>
            {targetJob.lastTailoredAt ? (
              <span className="text-xs text-muted-foreground">
                {tr("lastTailored", "Tailored moments ago")}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {result.response ? (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wand2 className="h-4 w-4 text-primary" />
                  {tr("results.title", "Tailored Results")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {beforeScore ? (
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{tr("results.before", "Before")}</p>
                      <p className={cn("text-2xl font-bold", getScoreTone(beforeScore.overall))}>
                        {beforeScore.overall}%
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-semibold text-emerald-600">
                        +{Math.max(score!.overall - beforeScore.overall, 0)}%
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{tr("results.after", "After")}</p>
                      <p className={cn("text-2xl font-bold", getScoreTone(score!.overall))}>
                        {score!.overall}%
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <div className="flex items-end gap-2">
                    <span className={cn("text-4xl font-bold", getScoreTone(score!.overall))}>
                      {score!.overall}%
                    </span>
                    <span className="text-sm text-muted-foreground">{tr("results.matchRate", "optimized score")}</span>
                  </div>
                  <Progress value={score!.overall} className="h-2" />
                  <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-muted-foreground">{tr("results.keywordMatch", "Keywords")}</p>
                      <p className="font-semibold">{score!.keywordMatch}%</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-muted-foreground">{tr("results.skillsMatch", "Skills")}</p>
                      <p className="font-semibold">{score!.skillsMatch}%</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Button type="button" onClick={onApplyTailored} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    {tr("actions.apply", "Apply To Current Resume")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onSaveTailoredDuplicate}
                    disabled={isSavingTailoredResume}
                    className="gap-2"
                  >
                    {isSavingTailoredResume ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {tr("actions.saveDuplicate", "Save As Duplicate")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue={defaultTab}>
                  <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-transparent p-2 md:grid-cols-4">
                    <TabsTrigger value="ats">{tr("tabs.ats", "ATS")}</TabsTrigger>
                    {result.response.coverLetter ? (
                      <TabsTrigger value="cover-letter">{tr("tabs.coverLetter", "Cover Letter")}</TabsTrigger>
                    ) : null}
                    {(result.response.interviewPrep?.questions?.length ?? 0) > 0 ? (
                      <TabsTrigger value="interview">{tr("tabs.interview", "Interview")}</TabsTrigger>
                    ) : null}
                    {(result.response.roadmap?.steps?.length ?? 0) > 0 ? (
                      <TabsTrigger value="roadmap">{tr("tabs.roadmap", "Roadmap")}</TabsTrigger>
                    ) : null}
                  </TabsList>

                  <TabsContent value="ats" className="space-y-4 p-5">
                    {score?.missingKeywords?.length ? (
                      <div className="space-y-2">
                        <h3 className="font-semibold">{tr("ats.missingKeywords", "Missing Keywords")}</h3>
                        <div className="flex flex-wrap gap-2">
                          {score.missingKeywords.slice(0, 12).map((keyword, index) => (
                            <span
                              key={`${keyword}-${index}`}
                              className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {score?.suggestions?.length ? (
                      <div className="space-y-2">
                        <h3 className="font-semibold">{tr("ats.suggestions", "Suggestions")}</h3>
                        <div className="space-y-2">
                          {score.suggestions.slice(0, 6).map((suggestion, index) => (
                            <div
                              key={`${suggestion}-${index}`}
                              className="rounded-xl border bg-muted/35 p-3 text-sm text-muted-foreground"
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </TabsContent>

                  {result.response.coverLetter ? (
                    <TabsContent value="cover-letter" className="space-y-4 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{tr("coverLetter.title", "Generated Cover Letter")}</h3>
                          <p className="text-sm text-muted-foreground">
                            {tr("coverLetter.subtitle", "Edit, copy, or download this version for your application.")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={onCopyCoverLetter}>
                            <Copy className="mr-2 h-4 w-4" />
                            {tr("coverLetter.copy", "Copy")}
                          </Button>
                          <Button variant="outline" size="sm" onClick={onDownloadCoverLetter}>
                            <FileText className="mr-2 h-4 w-4" />
                            {tr("coverLetter.download", "Download")}
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-2xl border bg-muted/20 p-4">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                          {result.response.coverLetter}
                        </pre>
                      </div>
                    </TabsContent>
                  ) : null}

                  {(result.response.interviewPrep?.questions?.length ?? 0) > 0 ? (
                    <TabsContent value="interview" className="space-y-3 p-5">
                      {result.response.interviewPrep?.questions.map((question, index) => (
                        <div key={`${question.question}-${index}`} className="rounded-xl border p-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-full bg-primary/10 p-2 text-primary">
                              <MessageSquare className="h-4 w-4" />
                            </div>
                            <div className="space-y-2">
                              <p className="font-medium">{question.question}</p>
                              {question.hint ? (
                                <p className="text-sm text-muted-foreground">
                                  {question.hint}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  ) : null}

                  {(result.response.roadmap?.steps?.length ?? 0) > 0 ? (
                    <TabsContent value="roadmap" className="space-y-4 p-5">
                      {(result.response.roadmap?.skillGaps?.length ?? 0) > 0 ? (
                        <div className="space-y-2">
                          <h3 className="font-semibold">{tr("roadmap.skillGaps", "Skill Gaps")}</h3>
                          <div className="flex flex-wrap gap-2">
                            {result.response.roadmap?.skillGaps?.map((gap, index) => (
                              <span
                                key={`${gap}-${index}`}
                                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                              >
                                {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-3">
                        {result.response.roadmap?.steps?.map((step, index) => (
                          <div key={`${step.step}-${index}`} className="flex gap-3 rounded-xl border p-4">
                            <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                              <Map className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{step.step}</p>
                              {step.timeframe ? (
                                <p className="text-sm text-muted-foreground">{step.timeframe}</p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ) : null}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">{tr("empty.title", "No tailored results yet")}</h3>
              <p className="text-sm text-muted-foreground">
                {tr("empty.description", "Paste a job description, then tailor this resume to see ATS improvements, cover letters, and interview prep.")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
