"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { ResumeService, ResumeSummary } from '@/services/resume.service';
import { ResumeCard } from '@/components/dashboard/ResumeCard';
import { useTranslations } from 'next-intl';

export default function ResumesPage() {
  const router = useRouter();
  const t = useTranslations('dashboard.personalPage');
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await ResumeService.getAll();
        setResumes(data);
      } catch (e) {
        console.error("Failed to fetch resumes", e);
        toast.error("Failed to load your resumes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
        await ResumeService.delete(id);
        setResumes(prev => prev.filter(r => r.id !== id));
        toast.success("Resume deleted");
    } catch (error) {
        toast.error("Failed to delete resume");
    }
  };

  const handleDownload = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/app/resume-builder?id=${id}&tab=export`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app">
           <Button variant="ghost" size="icon">
             <ArrowLeft className="h-4 w-4" />
           </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('cvs')}</h1>
          <p className="text-muted-foreground">
            View and manage all your created resumes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Create New Card */}
        <Link href="/app/resume-builder" className="group">
          <Card className="h-[200px] flex flex-col items-center justify-center border-dashed border-2 hover:border-primary hover:bg-muted/50 transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <span className="mt-4 font-semibold text-primary">Create New Resume</span>
          </Card>
        </Link>

        {/* Loading State */}
        {isLoading && Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-[200px] rounded-lg border bg-muted animate-pulse" />
        ))}

        {/* Resume Cards */}
        {!isLoading && resumes.map((resume) => (
          <ResumeCard 
            key={resume.id} 
            resume={resume} 
            onDelete={handleDelete} 
            onDownload={handleDownload} 
          />
        ))}
        
        {!isLoading && resumes.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
                <p>No resumes found. Create your first resume to get started!</p>
            </div>
        )}
      </div>
    </div>
  );
}
