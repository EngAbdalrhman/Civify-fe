"use client";

import { ResumeData } from '@/features/upload-cv/types';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';

interface ResumePreviewProps {
  data: ResumeData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
  const { metadata } = data;
  const templateId = metadata?.templateId || 'modern';
  const fontFamily = metadata?.fontFamily || 'Inter';
  const primaryColor = metadata?.primaryColor || '#000000';

  // Map template ID to component
  const renderTemplate = () => {
    switch (templateId) {
      case 'modern':
        return <ModernTemplate data={data} color={primaryColor} />;
      case 'classic':
        return <ClassicTemplate data={data} color={primaryColor} />;
      case 'creative':
        return <CreativeTemplate data={data} color={primaryColor} />;
      default:
        return <ModernTemplate data={data} color={primaryColor} />;
    }
  };

  return (
    <div 
      className="bg-white shadow-2xl p-0 w-[210mm] min-h-[297mm] mx-auto origin-top transition-all"
      style={{ fontFamily }}
      id="resume-preview-content"
    >
      {renderTemplate()}
    </div>
  );
}
