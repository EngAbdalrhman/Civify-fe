'use client';

import React from 'react';
import { useResume } from '@/context/ResumeContext';
import ModernTemplate from './templates/ModernTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import MinimalTemplate from './templates/MinimalTemplate';

const ResumePreview = () => {
  const { resumeData } = useResume();
  const { templateId } = resumeData.metadata;

  const renderTemplate = () => {
    switch (templateId) {
      case 'modern':
        return <ModernTemplate data={resumeData} />;
      case 'professional':
        return <ProfessionalTemplate data={resumeData} />;
      case 'minimal':
        return <MinimalTemplate data={resumeData} />;
      default:
        return <ModernTemplate data={resumeData} />;
    }
  };

  return (
    <div className="resume-preview-container bg-white shadow-sm min-h-[297mm] w-[210mm] mx-auto origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 transition-transform">
      {renderTemplate()}
    </div>
  );
};

export default ResumePreview;
