import React from 'react';
import { ResumeData } from '@/types/resume';

interface TemplateProps {
  data: ResumeData;
}

const MinimalTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, metadata } = data;

  return (
    <div className="min-h-[297mm] bg-white p-8 font-sans text-gray-900" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="grid grid-cols-[1fr_2fr] gap-8 h-full">
        
        {/* Left Column - Sidebar */}
        <div className="bg-gray-50 p-4 rounded-lg h-full">
           <div className="mb-8">
             <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {personalInfo.fullName}
            </h1>
            <p className="text-gray-600 font-medium mt-1">{personalInfo.jobTitle}</p>
           </div>

           <div className="space-y-4 text-sm text-gray-600 mb-8">
              {personalInfo.email && <div className="break-words">{personalInfo.email}</div>}
              {personalInfo.phone && <div>{personalInfo.phone}</div>}
              {personalInfo.address && <div>{personalInfo.address}</div>}
              {personalInfo.linkedin && <div className="break-words text-blue-600">{personalInfo.linkedin}</div>}
              {personalInfo.website && <div className="break-words text-blue-600">{personalInfo.website}</div>}
           </div>

           {/* Skills Section usually goes here in minimal layouts if it exists */}
           {sections.filter(s => s.type === 'skills').map(section => (
             <div key={section.id} className="mb-6">
               <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider mb-3 border-b border-gray-300 pb-1">
                 {section.title}
               </h3>
               <div className="flex flex-wrap gap-2">
                 {section.items.map(item => (
                   <span key={item.id} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                     {item.title}
                   </span>
                 ))}
               </div>
             </div>
           ))}
        </div>

        {/* Right Column - Main Content */}
        <div>
           {personalInfo.summary && (
            <div className="mb-8">
              <h2 className="font-bold text-gray-800 uppercase text-sm tracking-wider mb-3 border-b-2 border-gray-900 pb-1">
                Profile
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {personalInfo.summary}
              </p>
            </div>
           )}

           {sections
            .filter(s => s.isVisible && s.type !== 'skills') // Skills are in sidebar
            .sort((a, b) => a.order - b.order)
            .map(section => (
              <div key={section.id} className="mb-8">
                <h2 className="font-bold text-gray-800 uppercase text-sm tracking-wider mb-4 border-b-2 border-gray-900 pb-1">
                  {section.title}
                </h2>
                
                <div className="space-y-5">
                  {section.items.map(item => (
                    <div key={item.id}>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                        <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap">
                          {item.date}
                        </span>
                      </div>
                      
                      {item.subtitle && (
                        <p className="text-sm font-semibold text-gray-700 mb-1">{item.subtitle}</p>
                      )}
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MinimalTemplate;
