"use client";

import { ResumeData } from '@/features/upload-cv/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PersonalInfoForm } from './editor/PersonalInfoForm';
import { ExperienceForm } from './editor/ExperienceForm';
import { EducationForm } from './editor/EducationForm';
import { SkillsForm } from './editor/SkillsForm';
import { User, Briefcase, GraduationCap, Code } from 'lucide-react';

interface EditorPanelProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function EditorPanel({ data, onChange }: EditorPanelProps) {
  
  const updatePersonalInfo = (info: ResumeData['personalInfo']) => {
    onChange({ ...data, personalInfo: info });
  };

  const updateSection = (sectionId: string, items: any[]) => {
    const newSections = data.sections.map(section => {
      if (section.id === sectionId || section.type === sectionId) {
        return { ...section, items };
      }
      return section;
    });
    onChange({ ...data, sections: newSections });
  };

  // Helper to find section by type
  const getSection = (type: string) => data.sections.find(s => s.type === type);

  return (
    <Accordion type="single" collapsible defaultValue="personal" className="w-full">
      <AccordionItem value="personal">
        <AccordionTrigger className="hover:no-underline px-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span>Personal Information</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pt-2">
          <PersonalInfoForm data={data.personalInfo} onChange={updatePersonalInfo} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="experience">
        <AccordionTrigger className="hover:no-underline px-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span>Experience</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pt-2">
          <ExperienceForm 
            items={getSection('experience')?.items || []} 
            onChange={(items) => updateSection('experience', items)} 
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="education">
        <AccordionTrigger className="hover:no-underline px-2">
           <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>Education</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pt-2">
           <EducationForm 
            items={getSection('education')?.items || []} 
            onChange={(items) => updateSection('education', items)} 
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="skills">
        <AccordionTrigger className="hover:no-underline px-2">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            <span>Skills</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pt-2">
           <SkillsForm 
            items={getSection('skills')?.items || []} 
            onChange={(items) => updateSection('skills', items)} 
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
