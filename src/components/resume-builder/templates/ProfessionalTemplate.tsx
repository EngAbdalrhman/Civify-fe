import React from 'react';
import { ResumeData } from '@/types/resume';

interface TemplateProps {
  data: ResumeData;
}

const ProfessionalTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, metadata } = data;

  return (
    <div className="min-h-[297mm] bg-white p-10 font-serif text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header - Centered */}
      <header className="mb-8 text-center border-b-2 border-gray-800 pb-6">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-gray-900">
          {personalInfo.fullName}
        </h1>
        <div className="mt-2 flex justify-center gap-3 text-sm text-gray-600 italic">
           {personalInfo.email && <span>{personalInfo.email}</span>}
           {personalInfo.phone && <span>| {personalInfo.phone}</span>}
           {personalInfo.city && <span>| {personalInfo.city}</span>}
           {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6 text-center max-w-3xl mx-auto">
          <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {sections
          .filter((s) => s.isVisible)
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <section key={section.id}>
              <h2 className="mb-3 text-center text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1">
                {section.title}
              </h2>
              
              <div className="space-y-4 mt-4">
                {section.type === 'skills' ? (
                   <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                      {section.items.map((item) => {
                         const style = section.style || 'text'; // Default to text for Professional
                         let level = 3;
                         if (item.subtitle === 'Beginner') level = 2;
                         if (item.subtitle === 'Intermediate') level = 3;
                         if (item.subtitle === 'Advanced') level = 4;
                         if (item.subtitle === 'Expert') level = 5;

                         return (
                           <div key={item.id} className="flex items-center gap-2">
                             <span className="font-bold text-gray-800">{item.title}</span>
                             
                             {style === 'dots' && (
                               <div className="flex gap-1">
                                 {[1, 2, 3, 4, 5].map((i) => (
                                   <div
                                     key={i}
                                     className={`h-1.5 w-1.5 rounded-full ${i <= level ? 'bg-gray-800' : 'bg-gray-300'}`}
                                   />
                                 ))}
                               </div>
                             )}

                             {style === 'bar' && (
                               <div className="w-16 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                                 <div 
                                   className="h-full bg-gray-800" 
                                   style={{ width: `${(level / 5) * 100}%` }} 
                                 />
                               </div>
                             )}

                             {style === 'text' && item.subtitle && (
                                <span className="text-xs text-gray-500 uppercase tracking-wider">({item.subtitle})</span>
                             )}
                           </div>
                         );
                      })}
                   </div>
                ) : (
                  section.items.map((item) => (
                    <div key={item.id} className="mb-4">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                        <span className="text-sm font-medium text-gray-600 italic">{item.date}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-1">
                         {item.subtitle && (
                          <p className="text-gray-700 font-semibold">{item.subtitle}</p>
                        )}
                        {item.location && (
                          <span className="text-xs text-gray-500">{item.location}</span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-sm text-gray-700 mt-1 leading-relaxed text-justify">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
};

export default ProfessionalTemplate;
