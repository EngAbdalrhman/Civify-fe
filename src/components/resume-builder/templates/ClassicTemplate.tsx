"use client";

import { ResumeData } from '@/features/upload-cv/types';

interface TemplateProps {
  data: ResumeData;
  color: string;
}

export function ClassicTemplate({ data, color }: TemplateProps) {
  const { personalInfo, sections } = data;

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
       {sections.filter(s => s.visible !== false).map(section => (
         <section key={section.id} className="mb-6">
           <h3 className="text-lg font-bold uppercase border-b border-gray-800 mb-4 flex items-center">
             <span className="bg-gray-800 text-white px-2 py-0.5 text-sm mr-2" style={{ backgroundColor: color }}>
                {section.title.charAt(0)}
             </span>
             {section.title}
           </h3>

           {section.type === 'skills' ? (
             <div className="text-sm">
                {/* Comma separated skills for classic look */}
                {section.items.map(item => {
                   const tags = item.tags?.join(', ');
                   return tags ? (
                     <div key={item.id} className="mb-2">
                       <span className="font-bold">{item.title}: </span>
                       <span>{tags}</span>
                     </div>
                   ) : null;
                })}
             </div>
           ) : (
             <div className="space-y-4">
               {section.items.filter(i => i.visible !== false).map(item => (
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
