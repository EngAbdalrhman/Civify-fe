"use client";

import { useState, useEffect, useCallback } from 'react';
import { ResumeData } from '@/features/upload-cv/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutTemplate, 
  Palette, 
  Download, 
  Save, 
  RotateCcw,
  FileText,
  Type,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ResumeService } from '@/services/resume.service';

// Placeholder imports - we will create these next
import { ResumePreview } from './ResumePreview';
import { EditorPanel } from './EditorPanel';
import { DesignPanel } from './DesignPanel';
import { ExportPanel } from './ExportPanel';

interface ResumeBuilderProps {
  initialData: ResumeData;
  isGuest: boolean;
}

export function ResumeBuilder({ initialData, isGuest }: ResumeBuilderProps) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialData);
  const [activeTab, setActiveTab] = useState('content');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Guest Persistence
  useEffect(() => {
    if (isGuest) {
      localStorage.setItem('civify_guest_resume', JSON.stringify(resumeData));
    }
  }, [resumeData, isGuest]);

  const handleSave = async () => {
    if (isGuest) {
      toast.info("Sign in to save your resume permanently", {
        action: {
          label: "Sign In",
          onClick: () => router.push('/login?callbackUrl=/app/resume-builder')
        }
      });
      return;
    }

    setIsSaving(true);
    try {
      if (resumeData.id) {
          await ResumeService.update(resumeData.id, resumeData.personalInfo.title || 'Untitled CV', resumeData);
      } else {
          await ResumeService.create(resumeData.personalInfo.title || 'Untitled CV', resumeData);
      }
      toast.success("Resume saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar - Editor Configuration */}
      <div className="w-[400px] md:w-[450px] flex-shrink-0 border-r bg-card flex flex-col h-full z-10 shadow-xl">
        <div className="p-4 border-b flex items-center justify-between bg-card">
          <h1 className="font-bold text-xl flex items-center gap-2">
            <span className="text-primary">Civify</span> Builder
          </h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setResumeData(initialData)} title="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-4 pt-4">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="content" className="flex gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="design" className="flex gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Design</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="content" className="mt-0 space-y-6 h-full pb-20">
              <EditorPanel data={resumeData} onChange={setResumeData} />
            </TabsContent>
            
            <TabsContent value="design" className="mt-0 h-full pb-20">
              <DesignPanel data={resumeData} onChange={setResumeData} />
            </TabsContent>

            <TabsContent value="export" className="mt-0 h-full pb-20">
              <ExportPanel data={resumeData} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Right Area - Live Preview */}
      <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
        <div className="absolute top-4 right-4 z-20 flex gap-2">
           <Button variant="secondary" size="sm" className="shadow-sm backdrop-blur-sm bg-background/80">
              <Maximize2 className="h-4 w-4 mr-2" />
              Full Screen
           </Button>
        </div>
        
        <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
          <div className="transform scale-[0.85] origin-top md:scale-100 transition-transform duration-200 ease-in-out">
            <ResumePreview data={resumeData} />
          </div>
        </div>
      </div>
    </div>
  );
}
