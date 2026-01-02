"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MoreVertical, Edit, Trash2, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { ResumeSummary } from '@/services/resume.service';
import { useRouter } from 'next/navigation';

interface ResumeCardProps {
  resume: ResumeSummary;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDownload: (id: string, e: React.MouseEvent) => void;
}

export function ResumeCard({ resume, onDelete, onDownload }: ResumeCardProps) {
  const router = useRouter();

  return (
    <Link href={`/app/resume-builder?id=${resume.id}`}>
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
                <DropdownMenuItem onClick={(e) => onDownload(resume.id, e)}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => onDelete(resume.id, e)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
