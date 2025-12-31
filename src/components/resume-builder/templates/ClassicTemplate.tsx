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

export function ClassicTemplate({ data, color }: TemplateProps) {
  const { personalInfo, sections, metadata } = data;
  const skillsStyle: SkillsDisplayStyle = metadata?.skillsDisplayStyle || 'tags';
  const languagesStyle: LanguagesDisplayStyle = metadata?.languagesDisplayStyle || 'level';

  const renderSkills = (section: any) => {
    const items = section.items.filter((item: any) => item.visible !== false);
    
    // Tags style
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

    // Level/Dots/Bar styles
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

  // Filter out empty sections
  const visibleSections = sections.filter(s => s.visible !== false && s.items && s.items.length > 0);

  return (
    <div className="p-10 h-full bg-white text-gray-900 font-serif leading-relaxed">
       {/* Centered Header */}
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
           {personalInfo.linkedin && <span>LinkedIn: {personalInfo.linkedin}</span>}
           {personalInfo.website && <span>{personalInfo.website}</span>}
         </div>
       </header>

       {/* Summary */}
       {personalInfo.summary && (
         <section className="mb-6 text-center max-w-2xl mx-auto">
           <h3 className="text-sm font-bold uppercase mb-2 border-b border-gray-300 inline-block px-4">Summary</h3>
           <p className="text-sm text-justify">
             {personalInfo.summary}
           </p>
         </section>
       )}

       {/* Sections */}
       {visibleSections.map(section => (
         <section key={section.id} className="mb-6">
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
                   <div className="text-sm text-gray-700">
                     {item.description}
                   </div>
                 </div>
               ))}
             </div>
           )}
         </section>
       ))}
    </div>
  );
}
