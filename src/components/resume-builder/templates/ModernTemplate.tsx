import React from 'react';
import { ResumeData } from '@/types/resume';

interface TemplateProps {
  data: ResumeData;
}

const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, metadata } = data;
  const primaryColor = metadata.primaryColor || '#2563eb'; // Default blue

  return (
    <div className="min-h-[297mm] bg-white p-8 font-sans text-gray-800" style={{ fontFamily: metadata.fontFamily }}>
      {/* Header */}
      <header className="mb-8 border-b-2 pb-4" style={{ borderColor: primaryColor }}>
        <h1 className="text-4xl font-bold uppercase tracking-wide" style={{ color: primaryColor }}>
          {personalInfo.fullName}
        </h1>
        <p className="text-xl font-medium text-gray-600 mt-1">{personalInfo.jobTitle}</p>
        
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.address && <span>• {personalInfo.address}, {personalInfo.city}</span>}
          {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
          {personalInfo.website && <span>• {personalInfo.website}</span>}
        </div>
        
        {personalInfo.summary && (
          <p className="mt-4 text-gray-700 leading-relaxed max-w-2xl">
            {personalInfo.summary}
          </p>
        )}
      </header>

      {/* Sections */}
      <div className="space-y-6">
        {sections
          .filter((s) => s.isVisible)
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <section key={section.id}>
              <h2
                className="mb-4 text-lg font-bold uppercase tracking-wider border-b pb-1"
                style={{ color: primaryColor, borderColor: '#e5e7eb' }}
              >
                {section.title}
              </h2>
              
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-2">
                    <div className="text-sm text-gray-500 font-medium">
                      {item.date}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      {item.subtitle && (
                        <p className="text-gray-600 font-medium text-sm">{item.subtitle}</p>
                      )}
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                          {item.description}
                        </p>
                      )}
                      {item.location && (
                         <p className="text-xs text-gray-400 mt-1">{item.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
};

export default ModernTemplate;
