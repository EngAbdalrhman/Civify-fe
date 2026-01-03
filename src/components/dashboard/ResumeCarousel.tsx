"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { ResumeService, ResumeSummary } from '@/services/resume.service';
import { ResumeCard } from './ResumeCard';

export function ResumeCarousel() {
  const t = useTranslations('dashboard.resumes');
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await ResumeService.getAll();
        setResumes(data);
      } catch (e) {
        console.error("Failed to fetch resumes", e);
        toast.error(t('loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, [t]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
        await ResumeService.delete(id);
        setResumes(prev => prev.filter(r => r.id !== id));
        toast.success(t('deleted'));
    } catch (error) {
        toast.error(t('deleteError'));
    }
  };

  const handleDownload = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/app/resume-builder?id=${id}&tab=export`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">{t('myResumes')}</h2>
        <Button variant="link" asChild>
          <Link href="/app/resumes">{t('viewAll')}</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Create New Card */}
        <Link href="/app/resume-builder" className="group">
          <Card className="h-[200px] flex flex-col items-center justify-center border-dashed border-2 hover:border-primary hover:bg-muted/50 transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <span className="mt-4 font-semibold text-primary">{t('createNew')}</span>
          </Card>
        </Link>

        {/* Loading State */}
        {isLoading && Array(2).fill(0).map((_, i) => (
          <div key={i} className="h-[200px] rounded-lg border bg-muted animate-pulse" />
        ))}

        {/* Resume Cards */}
        {!isLoading && resumes.slice(0, 3).map((resume) => (
          <ResumeCard 
            key={resume.id} 
            resume={resume} 
            onDelete={handleDelete} 
            onDownload={handleDownload} 
          />
        ))}
      </div>
    </div>
  );
}
