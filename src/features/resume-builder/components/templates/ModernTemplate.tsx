"use client";

import React from 'react';

import { ResumeData, SkillLevel, SkillsDisplayStyle, LanguagesDisplayStyle, CoursesDisplayStyle } from '@/features/upload-cv/types';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';
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

export function ModernTemplate({ data, color }: TemplateProps) {
  const { personalInfo, sections, metadata } = data;
  const skillsStyle: SkillsDisplayStyle = metadata?.skillsDisplayStyle || 'tags';
  const languagesStyle: LanguagesDisplayStyle = metadata?.languagesDisplayStyle || 'level';
  const coursesStyle: CoursesDisplayStyle = metadata?.coursesDisplayStyle || 'detailed';

  // Determine direction
  const direction = metadata?.layoutDirection === 'ltr' ? 'ltr' : 
                   metadata?.layoutDirection === 'rtl' ? 'rtl' : 
                   (metadata?.language === 'ar' ? 'rtl' : 'ltr');
  
  const isRtl = direction === 'rtl';

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
        <div className={`text-sm text-gray-600 whitespace-pre-wrap ${compactClass === 'leading-tight' ? 'leading-snug' : 'leading-relaxed'} ${isRtl ? 'text-right' : 'text-justify'}`}>
           {item.description}
        </div>
      )}
    </div>
  );

  const renderSkills = (section: any) => {
    const items = section.items.filter((item: any) => item.visible !== false);
    if (skillsStyle === 'tags') {
      return (
        <div className="flex flex-wrap gap-2">
          {items.map((item: any) => (
            <span key={item.id} className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
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
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">{item.title}</span>
              <span className="text-sm text-gray-600 italic capitalize">{item.subtitle || 'Intermediate'}</span>
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
              <span className="text-sm font-medium text-gray-800">{item.title}</span>
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
    summary: metadata?.language === 'ar' ? "الملخص المهني" : "Professional Summary",
    linkedin: metadata?.language === 'ar' ? "لينكد إن" : "LinkedIn",
    github: metadata?.language === 'ar' ? "جيت هب" : "GitHub",
  };

  const compactClass = metadata?.compactMode ? 'leading-tight' : 'leading-relaxed';
  const margins = metadata?.margins || { top: 32, bottom: 32, left: 32, right: 32 };
  const spacingLevel = metadata?.spacingLevel ?? 3;
  const sectionMargin = spacingLevel * 8; // e.g. 24px
  const itemGap = spacingLevel * 4; // e.g. 16px

  return (
    <div 
      className={`h-full bg-white text-gray-900 ${compactClass}`} 
      dir={direction}
      style={{
        paddingTop: `${margins.top}px`,
        paddingBottom: `${margins.bottom}px`,
        paddingLeft: `${margins.left}px`,
        paddingRight: `${margins.right}px`,
      }}
    >
      {/* Header */}
      <header className="border-b-2 pb-6" style={{ borderColor: color, marginBottom: `${sectionMargin}px` }}>
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2" style={{ color }}>
          {personalInfo.fullName}
        </h1>
        <p className="text-lg text-gray-600 mb-4">{personalInfo.jobTitle}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {personalInfo.email}</div>}
          {personalInfo.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {personalInfo.phone}</div>}
          {personalInfo.city && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {[personalInfo.city, personalInfo.country].filter(Boolean).join(', ')}</div>}
          {personalInfo.linkedin && (
            <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} 
               target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
              <Linkedin className="w-3 h-3" /> {labels.linkedin}
            </a>
          )}
          {personalInfo.github && (
            <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://github.com/${personalInfo.github}`} 
               target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
              <Github className="w-3 h-3" /> {labels.github}
            </a>
          )}
          {personalInfo.website && (
            <a href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} 
               target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
              <Globe className="w-3 h-3" /> {personalInfo.website}
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section style={{ marginBottom: `${sectionMargin}px` }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color, borderColor: color + '40' }}>
            {labels.summary}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed text-justify">{personalInfo.summary}</p>
        </section>
      )}

      {/* Dynamic Sections */}
      {visibleSections.map(section => (
        <section key={section.id} style={{ marginBottom: `${sectionMargin}px` }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b pb-1" style={{ color, borderColor: color + '40' }}>
            {section.title}
          </h3>
          
          {section.type === 'skills' ? (
            renderSkills(section)
          ) : section.type === 'languages' ? (
            renderLanguages(section)
          ) : shouldUseSimpleColumns(section) ? (
            renderSimpleCourses(section)
          ) : (
            <div className="flex flex-col" style={{ gap: `${itemGap}px` }}>
              {section.items.filter((i: any) => i.visible !== false).map(renderSectionItem)}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
