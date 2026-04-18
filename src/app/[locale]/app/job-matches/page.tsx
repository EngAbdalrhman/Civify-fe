import { Metadata } from 'next';
import { MatchAnalytics } from '@/features/job-matches/components/MatchAnalytics';
import { Target } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
    title: "Job Matches | HICv",
};

export default async function JobMatchesPage() {
    const t = await getTranslations("dashboard.jobMatches");
    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="w-6 h-6 text-primary" />
                    </div>
                    {t("title")}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {t("subtitle")}
                </p>
            </div>
            
            <MatchAnalytics />
        </div>
    );
}
