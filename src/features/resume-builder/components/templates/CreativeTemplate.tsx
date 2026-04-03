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

export function CreativeTemplate({ data, color }: TemplateProps) {
  const { personalInfo, sections, metadata } = data;
  const skillsStyle: SkillsDisplayStyle = metadata?.skillsDisplayStyle || 'tags';
  const languagesStyle: LanguagesDisplayStyle = metadata?.languagesDisplayStyle || 'level';
  const coursesStyle: CoursesDisplayStyle = metadata?.coursesDisplayStyle || 'simple';

  // Determine direction
  const direction = metadata?.layoutDirection === 'ltr' ? 'ltr' : 
                   metadata?.layoutDirection === 'rtl' ? 'rtl' : 
                   (metadata?.language === 'ar' ? 'rtl' : 'ltr');
  
  const isRtl = direction === 'rtl';

  const renderSkills = (section: any) => {
    const items = section.items.filter((item: any) => item.visible !== false);
    if (skillsStyle === 'tags') {
      return (
        <div className="flex flex-wrap gap-2">
          {items.map((item: any) => (
            <span key={item.id} className="bg-white/20 px-2 py-1 rounded text-xs">
              {item.title}
            </span>
          ))}
        </div>
      );
    }
    const displayStyle = skillsStyle === 'dots' ? 'dots' : skillsStyle === 'bar' ? 'bar' : 'text';
    return (
      <div className="space-y-2">
        {items.map((item: any) => {
          const level = item.level || parseLevel(item.subtitle);
          return (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-xs">{item.title}</span>
              <LevelVisualizer level={level} style={displayStyle} color="#ffffff" />
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
            <div key={item.id} className="text-xs">
              <span className="font-medium">{item.title}</span>
              {item.subtitle && <span className="text-white/80"> - {item.subtitle}</span>}
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
              <span className="text-xs">{item.title}</span>
              <LevelVisualizer level={level} style={displayStyle} color="#ffffff" />
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
      <div className={`grid gap-4 text-sm`} style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
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

  const shouldUseSimpleColumns = (section: any) => {
    if (section.type === 'skills' || section.type === 'languages') return false;
    const lowerTitle = section.title.toLowerCase();
    const isCourse = section.type === 'certifications' || lowerTitle.includes('course') || lowerTitle.includes('certif');
    const isSimpleList = lowerTitle.includes('interest') || lowerTitle.includes('hobb');
    return isSimpleList || (isCourse && coursesStyle === 'simple');
  };

  const skillsSections = sections.filter(s => s.visible !== false && s.type === 'skills' && s.items && s.items.some((i: any) => i.visible !== false));
  const languagesSections = sections.filter(s => s.visible !== false && s.type === 'languages' && s.items && s.items.some((i: any) => i.visible !== false));
  const otherSections = sections.filter(s => s.type !== 'skills' && s.type !== 'languages' && s.visible !== false && s.items && s.items.some((i: any) => i.visible !== false));

  const labels = {
    profile: metadata?.language === 'ar' ? "الملف الشخصي" : "Profile",
    linkedin: metadata?.language === 'ar' ? "لينكد إن" : "LinkedIn",
    github: metadata?.language === 'ar' ? "جيت هب" : "GitHub",
  };

  const compactClass = metadata?.compactMode ? 'leading-tight' : 'leading-relaxed';
  const margins = metadata?.margins || { top: 32, bottom: 32, left: 32, right: 32 };
  const spacingLevel = metadata?.spacingLevel ?? 3;
  const sectionMargin = spacingLevel * 8; // e.g. 24px
  const sidebarSectionMargin = spacingLevel * 6; // slightly tighter for sidebar
  const itemGap = spacingLevel * 4; // e.g. 16px

  return (
    <div className="flex flex-1 w-full bg-white text-gray-900" dir={direction}>
      {/* Left Sidebar */}
      <aside className="w-[30%] text-white p-6" style={{ backgroundColor: color, display: 'flex', flexDirection: 'column', gap: `${sidebarSectionMargin}px` }}>
        <div className="text-center">
           {personalInfo.picture ? (
             <img src={personalInfo.picture} alt={personalInfo.fullName} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white/30" />
           ) : (
             <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
               {personalInfo.fullName.charAt(0)}
             </div>
           )}
           <h1 className="text-2xl font-bold uppercase leading-tight mb-2">
             {personalInfo.fullName}
           </h1>
           <p className="text-white/80 font-medium">{personalInfo.jobTitle}</p>
        </div>

        <div className="text-sm space-y-3 pt-4 border-t border-white/20">
           {personalInfo.email && <div className="break-words">{personalInfo.email}</div>}
           {personalInfo.phone && <div>{personalInfo.phone}</div>}
           {personalInfo.address && <div>{personalInfo.address}</div>}
           {personalInfo.linkedin && (
             <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} 
                target="_blank" rel="noopener noreferrer" className="block text-white/90 hover:text-white underline">
               {labels.linkedin}
             </a>
           )}
           {personalInfo.github && (
             <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://github.com/${personalInfo.github}`} 
                target="_blank" rel="noopener noreferrer" className="block text-white/90 hover:text-white underline">
               {labels.github}
             </a>
           )}
           {personalInfo.website && (
             <a href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} 
                target="_blank" rel="noopener noreferrer" className="block text-white/90 hover:text-white underline break-words">
               {personalInfo.website}
             </a>
           )}
        </div>

        {skillsSections.map(section => (
          <div key={section.id} className="pt-4 border-t border-white/20">
            <h3 className="font-bold uppercase mb-3 text-white/90">{section.title}</h3>
            {renderSkills(section)}
          </div>
        ))}

        {languagesSections.map(section => (
          <div key={section.id} className="pt-4 border-t border-white/20">
            <h3 className="font-bold uppercase mb-3 text-white/90">{section.title}</h3>
            {renderLanguages(section)}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 text-gray-800">
         {personalInfo.summary && (
           <section style={{ marginBottom: `${sectionMargin}px` }}>
             <h2 className="text-xl font-bold uppercase mb-4 text-gray-900 border-b-2 pb-1" style={{ borderColor: color }}>{labels.profile}</h2>
             <p className="text-gray-600 leading-relaxed text-sm">{personalInfo.summary}</p>
           </section>
         )}

         {otherSections.map(section => (
           <section key={section.id} style={{ marginBottom: `${sectionMargin}px` }}>
             <h2 className="text-xl font-bold uppercase mb-4 text-gray-900 border-b-2 pb-1" style={{ borderColor: color }}>
               {section.title}
             </h2>
             
             {shouldUseSimpleColumns(section) ? (
               renderSimpleCourses(section)
             ) : (
               <div className="flex flex-col" style={{ gap: `${itemGap}px` }}>
                  {section.items.filter((i: any) => i.visible !== false).map((item: any) => (
                     <div key={item.id} className="relative pl-4 border-l-2 border-gray-200">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                        <h3 className="font-bold text-gray-800 text-lg">{item.subtitle}</h3>
                        <div className="text-sm font-semibold text-gray-600 mb-1">{item.title}</div>
                        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                          {[item.date, item.location].filter(Boolean).join(' | ')}
                        </div>
                        {item.description && <p className={`text-sm text-gray-600 whitespace-pre-wrap ${compactClass === 'leading-tight' ? 'leading-snug' : 'leading-relaxed'}`}>{item.description}</p>}
                     </div>
                  ))}
               </div>
             )}
           </section>
         ))}
      </main>
    </div>
  );
}
