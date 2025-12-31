"use client";

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

  // Simple bullet list for courses/certifications
  const renderSimpleCourses = (section: any) => {
    const items = section.items.filter((item: any) => item.visible !== false);
    const columnCount = 3;
    const itemsPerColumn = Math.ceil(items.length / columnCount);
    const columns: any[][] = [];
    for (let i = 0; i < columnCount; i++) {
      columns.push(items.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
    }
    
    return (
      <div className="grid grid-cols-3 gap-4 text-sm">
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

  const visibleSections = sections.filter(s => s.visible !== false && s.items && s.items.length > 0);

  return (
    <div className="p-8 h-full bg-white text-gray-900">
      {/* Header */}
      <header className="border-b-2 pb-6 mb-6" style={{ borderColor: color }}>
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2" style={{ color }}>
          {personalInfo.fullName}
        </h1>
        <p className="text-lg text-gray-600 mb-4">{personalInfo.jobTitle}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {personalInfo.email}</div>}
          {personalInfo.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {personalInfo.phone}</div>}
          {personalInfo.city && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {[personalInfo.city, personalInfo.country].filter(Boolean).join(', ')}</div>}
          {personalInfo.linkedin && <div className="flex items-center gap-1"><Linkedin className="w-3 h-3" /> {personalInfo.linkedin}</div>}
          {personalInfo.github && <div className="flex items-center gap-1"><Github className="w-3 h-3" /> {personalInfo.github}</div>}
          {personalInfo.website && <div className="flex items-center gap-1"><Globe className="w-3 h-3" /> {personalInfo.website}</div>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color, borderColor: color + '40' }}>
            Professional Summary
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed text-justify">{personalInfo.summary}</p>
        </section>
      )}

      {/* Dynamic Sections */}
      {visibleSections.map(section => (
        <section key={section.id} className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b pb-1" style={{ color, borderColor: color + '40' }}>
            {section.title}
          </h3>
          
          {section.type === 'skills' ? (
            renderSkills(section)
          ) : section.type === 'languages' ? (
            renderLanguages(section)
          ) : isCertOrCourse(section.type, section.title) && coursesStyle === 'simple' ? (
            renderSimpleCourses(section)
          ) : (
            <div className="space-y-4">
              {section.items.filter((i: any) => i.visible !== false).map(renderSectionItem)}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
