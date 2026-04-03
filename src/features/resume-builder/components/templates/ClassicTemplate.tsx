"use client";

import React from 'react';

import { ResumeData, SkillLevel, SkillsDisplayStyle, LanguagesDisplayStyle, CoursesDisplayStyle } from '@/features/upload-cv/types';
import { LevelVisualizer } from './LevelVisualizer';

interface TemplateProps {
  data: ResumeData;
  color: string;
}

function parseLevel(value?: string): SkillLevel {
  if (!value) return 'intermediate';
  const lower = value.toLowerCase();
  if (lower === 'native' || lower === 'fluent' || lower === 'expert') return 'expert';
  if (lower === 'advanced') return 'advanced';
  if (lower === 'intermediate') return 'intermediate';
  if (lower === 'beginner') return 'beginner';
  return 'intermediate';
}

export function ClassicTemplate({ data, color }: TemplateProps) {
  const { personalInfo, sections, metadata } = data;
  const skillsStyle: SkillsDisplayStyle = metadata?.skillsDisplayStyle || 'tags';
  const languagesStyle: LanguagesDisplayStyle = metadata?.languagesDisplayStyle || 'level';
  const coursesStyle: CoursesDisplayStyle = metadata?.coursesDisplayStyle || 'detailed';

  // Determine direction
  const direction = metadata?.layoutDirection === 'ltr' ? 'ltr' : 
                   metadata?.layoutDirection === 'rtl' ? 'rtl' : 
                   (metadata?.language === 'ar' ? 'rtl' : 'ltr');
  
  const isRtl = direction === 'rtl';

  const renderSkills = (section: any) => {
    const items = section.items.filter((item: any) => item.visible !== false);
    if (skillsStyle === 'tags') {
      return (
        <div className="flex flex-wrap gap-2 text-sm">
          {items.map((item: any) => (
            <span key={item.id} className="inline-block bg-gray-100 px-2 py-1 rounded mr-1 mb-1">
              {item.title}
            </span>
          ))}
        </div>
      );
    }
    const displayStyle = skillsStyle === 'dots' ? 'dots' : skillsStyle === 'bar' ? 'bar' : 'text';
    return (
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {items.map((item: any) => {
          const level = item.level || parseLevel(item.subtitle);
          return (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-800">{item.title}</span>
              <LevelVisualizer level={level} style={displayStyle} color={color} />
            </div>
          );
        })}
      </div>
    );
  };

  const renderLanguages = (section: any) => {
    const items = section.items.filter((item: any) => item.visible !== false);
    if (languagesStyle === 'level') {
      return (
        <div className="space-y-1">
          {items.map((item: any) => (
            <div key={item.id} className="text-sm">
              <span className="font-bold text-gray-800">{item.title}</span>
              {item.subtitle && <span className="text-gray-600"> - {item.subtitle}</span>}
            </div>
          ))}
        </div>
      );
    }
    const displayStyle = languagesStyle === 'dots' ? 'dots' : 'bar';
    return (
      <div className="space-y-2">
        {items.map((item: any) => {
          const level = item.level || parseLevel(item.subtitle);
          return (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">{item.title}</span>
              <LevelVisualizer level={level} style={displayStyle} color={color} />
            </div>
          );
        })}
      </div>
    );
  };

  // Simple bullet list for courses/certifications/interests/hobbies
  const renderSimpleCourses = (section: any) => {
    const items = section.items.filter((item: any) => item.visible !== false);
    const columnCount = metadata?.sectionColumns?.[section.id] ?? 3;
    const itemsPerColumn = Math.ceil(items.length / columnCount);
    const columns: any[][] = [];
    for (let i = 0; i < columnCount; i++) {
      columns.push(items.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
    }
    
    return (
      <div className={`grid gap-x-8 gap-y-2 text-sm max-w-full`} style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
        {columns.map((column, colIdx) => (
          <ul key={colIdx} className="list-disc list-inside space-y-1">
            {column.map((item: any) => (
              <li key={item.id} className="text-gray-700">{item.title}</li>
            ))}
          </ul>
        ))}
      </div>
    );
  };

  const isCertOrCourse = (type: string, title: string) => {
    const lowerTitle = title.toLowerCase();
    return type === 'certifications' || lowerTitle.includes('course') || lowerTitle.includes('certif');
  };

  const isSimpleListSection = (type: string, title: string) => {
    const lowerTitle = title.toLowerCase();
    return type === 'interests' || lowerTitle.includes('interest') || lowerTitle.includes('hobby') || lowerTitle.includes('hobbies');
  };

  const shouldUseSimpleColumns = (section: any) => {
    if (section.type === 'skills' || section.type === 'languages') return false;
    if (isCertOrCourse(section.type, section.title) && coursesStyle === 'simple') return true;
    if (isSimpleListSection(section.type, section.title)) return true;
    if (metadata?.sectionColumns?.[section.id]) return true;
    return false;
  };

  const visibleSections = sections.filter(s => s.visible !== false && s.items && s.items.some((i: any) => i.visible !== false));


  const labels = {
    summary: metadata?.language === 'ar' ? "الملخص" : "Summary",
    linkedin: metadata?.language === 'ar' ? "لينكد إن" : "LinkedIn",
    github: metadata?.language === 'ar' ? "جيت هب" : "GitHub",
  };

  const compactClass = metadata?.compactMode ? 'leading-tight' : 'leading-relaxed';
  const margins = metadata?.margins || { top: 40, bottom: 40, left: 40, right: 40 };
  const spacingLevel = metadata?.spacingLevel ?? 3;
  const sectionMargin = spacingLevel * 8; // e.g. 24px for level 3
  const itemGap = spacingLevel * 4; // e.g. 12px for level 3

  return (
    <div className="p-10 h-full bg-white text-gray-900 leading-relaxed" dir={direction}>
       <header className="text-center mb-8 border-b-2 border-double border-gray-300 pb-6">
         <h1 className="text-3xl font-bold uppercase mb-2 tracking-wide text-gray-900">
           {personalInfo.fullName}
         </h1>
         <div className="text-gray-600 italic mb-3">{personalInfo.jobTitle}</div>
         <div className="text-sm text-gray-600 flex flex-wrap justify-center gap-x-4">
           {personalInfo.email && <span>{personalInfo.email}</span>}
           {personalInfo.phone && <span>• {personalInfo.phone}</span>}
           {personalInfo.city && <span>• {[personalInfo.city, personalInfo.country].filter(Boolean).join(', ')}</span>}
         </div>
          <div className="text-sm text-gray-600 flex flex-wrap justify-center gap-x-4 mt-1">
           {personalInfo.linkedin && (
             <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} 
                target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
               {labels.linkedin}
             </a>
           )}
           {personalInfo.github && (
             <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://github.com/${personalInfo.github}`} 
                target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
               {labels.github}
             </a>
           )}
           {personalInfo.website && (
             <a href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} 
                target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
               {personalInfo.website}
             </a>
           )}
         </div>
       </header>

       {personalInfo.summary && (
         <section className="text-center max-w-2xl mx-auto" style={{ marginBottom: `${sectionMargin}px` }}>
           <h3 className="text-sm font-bold uppercase mb-2 border-b border-gray-300 inline-block px-4">{labels.summary}</h3>
           <p className="text-sm text-justify">{personalInfo.summary}</p>
         </section>
       )}

       {visibleSections.map(section => (
         <section key={section.id} style={{ marginBottom: `${sectionMargin}px` }}>
           <h3 className="text-lg font-bold uppercase border-b border-gray-800 mb-4 flex items-center">
             <span className="bg-gray-800 text-white px-2 py-0.5 text-sm mr-2" style={{ backgroundColor: color }}>
                {section.title.charAt(0)}
             </span>
             {section.title}
           </h3>

           {section.type === 'skills' ? (
             renderSkills(section)
           ) : section.type === 'languages' ? (
             renderLanguages(section)
           ) : shouldUseSimpleColumns(section) ? (
             renderSimpleCourses(section)
           ) : (
             <div className="space-y-4">
               {section.items.filter((i: any) => i.visible !== false).map((item: any) => (
                 <div key={item.id}>
                   <div className="flex justify-between font-bold text-gray-800 text-sm">
                     <span>{item.title}</span>
                     <span>{item.date}</span>
                   </div>
                   <div className="flex justify-between text-gray-600 italic text-sm mb-1">
                      <span>{item.subtitle}</span>
                      <span>{item.location}</span>
                   </div>
                   {item.description && <div className="text-sm text-gray-700">{item.description}</div>}
                 </div>
               ))}
             </div>
           )}
         </section>
       ))}
    </div>
  );
}
