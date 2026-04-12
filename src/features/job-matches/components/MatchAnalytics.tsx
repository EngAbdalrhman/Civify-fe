"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Target, Loader2, Calendar, Building2, Briefcase } from "lucide-react";
import { jobMatchService } from "@/features/resume-builder/services/job-match.service";

export function MatchAnalytics() {
    const t = useTranslations("dashboard");
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await jobMatchService.getHistory(0, 20);
                setHistory(data.content || []);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-primary/10 p-6 mb-4">
                    <Target className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Job Matches Yet</h3>
                <p className="text-muted-foreground w-[90%] md:w-1/2">
                    Start optimizing your resume for specific job descriptions using our Job Match feature inside the Resume Builder.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {history.map((record, i) => (
                    <div key={i} className="rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(record.analyzedAt).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                record.overallScore >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                                record.overallScore >= 50 ? 'bg-orange-500/10 text-orange-600' :
                                'bg-destructive/10 text-destructive'
                            }`}>
                                {record.overallScore}% Match
                            </span>
                        </div>
                        <h4 className="font-semibold text-lg line-clamp-1 mb-1">
                            <Briefcase className="h-4 w-4 inline mr-2 text-muted-foreground" />
                            {record.jobTitle || "Job Target"}
                        </h4>
                        {record.companyName && record.companyName !== 'null' && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                                <Building2 className="h-4 w-4" />
                                {record.companyName}
                            </p>
                        )}
                        <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Skills: {record.skillsScore}%</span>
                            <span className="text-muted-foreground">Keywords: {record.keywordScore}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
