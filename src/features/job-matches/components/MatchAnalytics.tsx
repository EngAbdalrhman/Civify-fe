"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Target, Loader2, Calendar, Building2, Briefcase, TrendingUp, AlertCircle, Award } from "lucide-react";
import { jobMatchService, JobMatchAnalytics as AnalyticsData } from "@/features/resume-builder/services/job-match.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MatchAnalytics() {
    const t = useTranslations("dashboard");
    const [history, setHistory] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [historyData, analyticsData] = await Promise.all([
                    jobMatchService.getHistory(0, 20),
                    jobMatchService.getAnalytics()
                ]);
                setHistory(historyData.content || []);
                setAnalytics(analyticsData);
            } catch (error) {
                console.error("Failed to fetch match data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const getFollowUpStatus = (analyzedAt: string) => {
        const daysSince = (new Date().getTime() - new Date(analyzedAt).getTime()) / (1000 * 3600 * 24);
        if (daysSince < 3) return { label: "Fresh", color: "bg-emerald-500/10 text-emerald-600" };
        if (daysSince <= 7) return { label: "Follow up", color: "bg-amber-500/10 text-amber-600" };
        return { label: "Overdue", color: "bg-destructive/10 text-destructive" };
    };

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
            {/* Analytics Header */}
            {analytics && analytics.totalAnalyses > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Match Score</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.averageScore}%</div>
                            <p className="text-xs text-muted-foreground mt-1">Across {analytics.totalAnalyses} targets</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Strongest Area</CardTitle>
                            <Award className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{analytics.strongestArea}</div>
                            <p className="text-xs text-muted-foreground mt-1">Consistently matched</p>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Missing Skills</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {analytics.topMissingSkills?.length > 0 ? (
                                    analytics.topMissingSkills.map(skill => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No recurring missing skills</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Recent Targets
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {history.map((record, i) => {
                    const followUp = getFollowUpStatus(record.analyzedAt);
                    
                    return (
                        <div key={i} className="rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(record.analyzedAt).toLocaleDateString()}
                                </span>
                                <div className="flex gap-2 items-center">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${followUp.color}`}>
                                        {followUp.label}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        record.overallScore >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                                        record.overallScore >= 50 ? 'bg-orange-500/10 text-orange-600' :
                                        'bg-destructive/10 text-destructive'
                                    }`}>
                                        {record.overallScore}% Match
                                    </span>
                                </div>
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
                    );
                })}
            </div>
        </div>
    );
}
