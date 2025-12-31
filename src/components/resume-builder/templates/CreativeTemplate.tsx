"use client";

import { ResumeData, SkillLevel, SkillsDisplayStyle, LanguagesDisplayStyle } from '@/features/upload-cv/types';
import { LevelVisualizer } from './LevelVisualizer';

interface TemplateProps {
  data: ResumeData;
  color: string;
}

// Map subtitle/level strings to SkillLevel
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

  const renderSkills = (section: any) => {
    const items = section.items.filter((item: any) => item.visible !== false);
    
    // Tags style
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

    // Level/Dots/Bar styles
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

  // Filter out empty sections
  const skillsSections = sections.filter(s => s.type === 'skills' && s.items && s.items.length > 0);
  const languagesSections = sections.filter(s => s.type === 'languages' && s.items && s.items.length > 0);
  const otherSections = sections.filter(s => s.type !== 'skills' && s.type !== 'languages' && s.visible !== false && s.items && s.items.length > 0);

  return (
    <div className="flex h-full bg-white">
      {/* Left Sidebar */}
      <aside className="w-[30%] text-white p-6 space-y-6" style={{ backgroundColor: color }}>
        <div className="text-center">
           {/* Profile Picture Placeholder */}
           <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
              {personalInfo.fullName.charAt(0)}
           </div>
           <h1 className="text-2xl font-bold uppercase leading-tight mb-2">
             {personalInfo.fullName}
           </h1>
           <p className="text-white/80 font-medium">{personalInfo.jobTitle}</p>
        </div>

        <div className="text-sm space-y-3 pt-4 border-t border-white/20">
           {personalInfo.email && <div className="break-words">{personalInfo.email}</div>}
           {personalInfo.phone && <div>{personalInfo.phone}</div>}
           {personalInfo.address && <div>{personalInfo.address}</div>}
           {personalInfo.linkedin && <div className="break-words">{personalInfo.linkedin}</div>}
        </div>

        {/* Skills in Sidebar */}
        {skillsSections.map(section => (
          <div key={section.id} className="pt-4 border-t border-white/20">
            <h3 className="font-bold uppercase mb-3 text-white/90">{section.title}</h3>
            {renderSkills(section)}
          </div>
        ))}

        {/* Languages in Sidebar */}
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
           <section className="mb-8">
             <h2 className="text-xl font-bold uppercase mb-4 text-gray-900 border-b-2 pb-1" style={{ borderColor: color }}>Profile</h2>
             <p className="text-gray-600 leading-relaxed text-sm">{personalInfo.summary}</p>
           </section>
         )}

         {otherSections.map(section => (
           <section key={section.id} className="mb-8">
             <h2 className="text-xl font-bold uppercase mb-4 text-gray-900 border-b-2 pb-1" style={{ borderColor: color }}>
               {section.title}
             </h2>
             
             <div className="space-y-6">
                {section.items.filter((i: any) => i.visible !== false).map((item: any) => (
                   <div key={item.id} className="relative pl-4 border-l-2 border-gray-200">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                      <h3 className="font-bold text-gray-800 text-lg">{item.subtitle}</h3>
                      <div className="text-sm font-semibold text-gray-600 mb-1">{item.title}</div>
                      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                        {[item.date, item.location].filter(Boolean).join(' | ')}
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {item.description}
                      </p>
                   </div>
                ))}
             </div>
           </section>
         ))}
      </main>
    </div>
  );
}
