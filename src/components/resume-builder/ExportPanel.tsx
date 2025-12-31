"use client";

import { ResumeData } from '@/features/upload-cv/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileType } from 'lucide-react';
import { exportToPdf, exportToDocx } from '@/features/upload-cv/utils/exportCv';
import { toast } from 'sonner';

interface ExportPanelProps {
  data: ResumeData;
}

export function ExportPanel({ data }: ExportPanelProps) {
  
  const handlePdfExport = async () => {
    try {
      const element = document.getElementById('resume-preview-content');
      if (!element) throw new Error("Preview element not found");
      
      // Inject data for helper
      (window as any).__cvExportData = data;
      
      await exportToPdf(element, `${data.personalInfo.fullName.replace(/\s+/g, '_')}_CV`, data);
      toast.success("PDF Downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF");
    }
  };

  const handleDocxExport = async () => {
     try {
      await exportToDocx(data, `${data.personalInfo.fullName.replace(/\s+/g, '_')}_CV`);
      toast.success("DOCX Downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export DOCX");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Ready to download?</h3>
        <p className="text-muted-foreground text-sm">
          Select a format to export your resume.
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handlePdfExport}>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <FileType className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base">PDF Document</CardTitle>
              <CardDescription>Best for sharing and printing. Preserves layout.</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleDocxExport}>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base">Word Document</CardTitle>
              <CardDescription>Editable in Microsoft Word or Google Docs.</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg text-sm text-balance text-muted-foreground text-center">
        Tip: Review your resume in the preview panel before downloading to ensure everything looks perfect.
      </div>
    </div>
  );
}
