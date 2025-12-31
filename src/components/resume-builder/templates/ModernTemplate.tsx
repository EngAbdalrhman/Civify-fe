"use client";

import { ResumeData } from '@/features/upload-cv/types';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
  color: string;
}

export function ModernTemplate({ data, color }: TemplateProps) {
  const { personalInfo, sections } = data;

  const renderSectionItem = (item: any) => (
    <div key={item.id} className="mb-4 break-inside-avoid">
       <div className="flex justify-between items-baseline">
        <h4 className="font-bold text-gray-800">{item.title}</h4>
        <span className="text-sm text-gray-600 italic">
          {[item.date, item.location].filter(Boolean).join(' | ')}
        </span>
      </div>
      {item.subtitle && <div className="text-sm font-semibold text-gray-700 mb-1">{item.subtitle}</div>}
      {item.description && (
        <div className="text-sm text-gray-600 whitespace-pre-wrap leading-snug">
           {item.description}
        </div>
      )}
       {item.tags && item.tags.length > 0 && (
         <div className="flex flex-wrap gap-1 mt-1">
           {item.tags.map((tag: string, idx: number) => (
             <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
               {tag}
             </span>
           ))}
         </div>
       )}
    </div>
  );

  return (
    <div className="p-8 h-full bg-white text-gray-900">
      {/* Header */}
      <header className="border-b-2 pb-6 mb-6" style={{ borderColor: color }}>
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2" style={{ color }}>
          {personalInfo.fullName}
        </h1>
        <p className="text-lg text-gray-600 mb-4">{personalInfo.jobTitle}</p>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> {personalInfo.email}
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> {personalInfo.phone}
            </div>
          )}
           {personalInfo.city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {[personalInfo.city, personalInfo.country].filter(Boolean).join(', ')}
            </div>
          )}
          {personalInfo.linkedin && (
             <div className="flex items-center gap-1">
              <Linkedin className="w-3 h-3" /> {personalInfo.linkedin}
            </div>
          )}
           {personalInfo.github && (
             <div className="flex items-center gap-1">
              <Github className="w-3 h-3" /> {personalInfo.github}
            </div>
          )}
           {personalInfo.website && (
             <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> {personalInfo.website}
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color, borderColor: color + '40' }}>
            Professional Summary
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed text-justify">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Dynamic Sections */}
      {sections.filter(s => s.isVisible).map(section => (
        <section key={section.id} className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b pb-1" style={{ color, borderColor: color + '40' }}>
            {section.title}
          </h3>
          
          {section.type === 'skills' ? (
             <div className="flex flex-wrap gap-2">
               {/* Handle flattened skills vs categorized */}
               {section.items.map(item => (
                 item.tags?.map((tag, i) => (
                   <span key={`${item.id}-${i}`} className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
                     {tag}
                   </span>
                 )) || (
                   <span key={item.id} className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
                    {item.title}
                   </span>
                 )
               ))}
             </div>
          ) : (
             <div className="space-y-4">
               {section.items.filter(i => i.isVisible !== false).map(renderSectionItem)}
             </div>
          )}
        </section>
      ))}
    </div>
  );
}
