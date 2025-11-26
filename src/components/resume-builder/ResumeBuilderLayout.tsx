'use client';

import React from 'react';
import { useResume } from '@/context/ResumeContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Save, Download, LayoutTemplate } from 'lucide-react';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';
import PDFExport from './PDFExport';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ResumeBuilderLayout = () => {
  const { resumeData, updateResumeData, saveResume, isSaving, isLoading } = useResume();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Toolbar */}
      <header className="flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Resume Builder</h1>
        <div className="flex items-center gap-4">
          <Select
            value={resumeData.metadata.templateId}
            onValueChange={(value) =>
              updateResumeData({
                metadata: { ...resumeData.metadata, templateId: value },
              })
            }
          >
            <SelectTrigger className="w-[180px]">
              <LayoutTemplate className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modern">Modern</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={saveResume} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
          
          {/* PDF Export Button */}
          <PDFExport data={resumeData} />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Forms */}
        <div className="w-1/2 border-r bg-white lg:w-2/5 xl:w-1/3">
          <ScrollArea className="h-full p-6">
            <ResumeForm />
          </ScrollArea>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-100 p-8">
          <div className="mx-auto h-full max-w-[210mm] overflow-hidden rounded shadow-lg bg-white">
             <ScrollArea className="h-full">
                <ResumePreview />
             </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderLayout;
