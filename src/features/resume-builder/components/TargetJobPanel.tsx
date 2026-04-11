"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Target, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { ResumeData } from "@/features/upload-cv/types";
import { jobMatchService, JobMatchResult } from "../services/job-match.service";

interface TargetJobPanelProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
}

export function TargetJobPanel({ data, onChange }: TargetJobPanelProps) {
    const [jobUrl, setJobUrl] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<JobMatchResult | null>(null);
    const t = useTranslations("builder");

    const handleAnalyze = async () => {
        if (!jobUrl.trim() && !jobDescription.trim()) {
            toast.error(t("targetJob.inputRequired"));
            return;
        }

        setIsAnalyzing(true);
        try {
            const matchResult = await jobMatchService.analyzeMatch({
                resumeData: data,
                jobUrl: jobUrl.trim() || undefined,
                jobDescription: jobDescription.trim() || undefined
            });
            setResult(matchResult);
            toast.success(`${t("targetJob.analysisComplete")} — ${matchResult.overallScore}%`);
        } catch (error: any) {
            const msg = error?.message || t("targetJob.analysisFailed");
            toast.error(msg);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4 rounded-lg border p-4 bg-card/50">
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        {t("targetJob.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t("targetJob.subtitle")}
                    </p>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="jobUrl">{t("targetJob.urlLabel")}</Label>
                        <Input
                            id="jobUrl"
                            placeholder="https://www.linkedin.com/jobs/view/..."
                            value={jobUrl}
                            onChange={(e) => setJobUrl(e.target.value)}
                            disabled={isAnalyzing}
                        />
                    </div>
                    
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-muted"></div>
                        <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">{t("targetJob.or")}</span>
                        <div className="flex-grow border-t border-muted"></div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="jobDesc">{t("targetJob.pasteLabel")}</Label>
                        <Textarea
                            id="jobDesc"
                            placeholder={t("targetJob.pastePlaceholder")}
                            rows={6}
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            disabled={isAnalyzing}
                        />
                    </div>
                    
                    <Button 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing || (!jobUrl.trim() && !jobDescription.trim())}
                        className="w-full gap-2"
                    >
                        {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isAnalyzing ? t("targetJob.analyzing") : t("targetJob.analyzeButton")}
                    </Button>
                </div>
            </div>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-center">
                            <div className="text-3xl font-bold text-primary">{result.overallScore}%</div>
                            <div className="text-xs text-muted-foreground mt-1 uppercase font-semibold tracking-wider">{t("targetJob.overallMatch")}</div>
                        </div>
                        <div className="bg-muted p-4 rounded-xl text-center">
                            <div className="text-3xl font-bold">{result.skillsScore}%</div>
                            <div className="text-xs text-muted-foreground mt-1 uppercase font-semibold tracking-wider">{t("targetJob.skillsMatch")}</div>
                        </div>
                    </div>

                    {result.parsedJd && (
                        <div className="space-y-2">
                            <h4 className="font-semibold px-1">{t("targetJob.roleDetails")}</h4>
                            <div className="text-sm bg-muted/50 p-3 rounded-lg border">
                                <span className="font-medium">{result.parsedJd.jobTitle}</span>
                                {result.parsedJd.companyName && result.parsedJd.companyName !== "null" && <span> at {result.parsedJd.companyName}</span>}
                                {result.parsedJd.seniority && <span className="block text-muted-foreground mt-1 capitalize">{result.parsedJd.seniority} Level</span>}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {result.missingSkills && result.missingSkills.length > 0 && (
                            <div className="bg-destructive/5 text-destructive border border-destructive/20 border-l-4 rounded-lg p-4">
                                <div className="flex items-center gap-2 font-semibold mb-2">
                                    <XCircle className="h-4 w-4" />
                                    <h4>{t("targetJob.missingSkills")}</h4>
                                </div>
                                <ul className="list-disc pl-4 mt-2 space-y-1 text-sm">
                                    {result.missingSkills.map((gap, i) => (
                                        <li key={i}>
                                            <strong>{gap.skill}</strong> 
                                            {gap.required ? ` (${t("targetJob.required")})` : ` (${t("targetJob.preferred")})`}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.matchedSkills && result.matchedSkills.length > 0 && (
                            <div className="bg-emerald-500/5 text-emerald-600 border border-emerald-500/20 border-l-4 rounded-lg p-4">
                                <div className="flex items-center gap-2 font-semibold mb-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <h4>{t("targetJob.matchedSkills")}</h4>
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    {result.matchedSkills.map((match, i) => (
                                        <span key={i} className="bg-emerald-500/10 px-2 py-1 rounded-md">{match.skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
