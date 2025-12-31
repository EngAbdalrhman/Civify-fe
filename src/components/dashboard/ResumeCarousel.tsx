"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, MoreVertical, Edit, Trash2, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ResumeData } from '@/features/upload-cv/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

import { ResumeService, ResumeSummary } from '@/services/resume.service';

export function ResumeCarousel() {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">My Resumes</h2>
        <Button variant="link" asChild>
          <Link href="/app/resumes">View All</Link>
        </Button>
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
        {isLoading && Array(2).fill(0).map((_, i) => (
          <div key={i} className="h-[200px] rounded-lg border bg-muted animate-pulse" />
        ))}

        {/* Resume Cards */}
        {!isLoading && resumes.map((resume) => (
          <Link href={`/app/resume-builder?id=${resume.id}`} key={resume.id}>
            <Card className="h-[200px] relative group overflow-hidden border hover:shadow-md transition-all">
              {/* Preview Area (Mock) */}
              <div className="h-[120px] bg-muted relative flex items-center justify-center">
                 <FileText className="h-16 w-16 text-muted-foreground/20" />
                 {/* Overlay Gradient */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
              </div>

              {/* Content Area */}
              <CardContent className="p-4 pt-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold truncate pr-2" title={resume.title}>{resume.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Edited {new Date(resume.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/app/resume-builder?id=${resume.id}`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleDownload(resume.id, e)}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => handleDelete(resume.id, e)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
