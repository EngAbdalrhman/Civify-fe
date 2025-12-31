"use client";

import { ResumeData, ResumeSection, SectionItem } from '@/features/upload-cv/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PersonalInfoForm } from './editor/PersonalInfoForm';
import { ExperienceForm } from './editor/ExperienceForm';
import { EducationForm } from './editor/EducationForm';
import { SkillsForm } from './editor/SkillsForm';
import { GenericSectionForm } from './editor/GenericSectionForm';
import { LanguagesForm } from './editor/LanguagesForm';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderGit2, 
  Award, 
  Languages as LanguagesIcon,
  Heart,
  LayoutList
} from 'lucide-react';

interface EditorPanelProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

// Icon mapping for section types
const sectionIcons: Record<string, React.ReactNode> = {
  experience: <Briefcase className="h-4 w-4 text-primary" />,
  education: <GraduationCap className="h-4 w-4 text-primary" />,
  skills: <Code className="h-4 w-4 text-primary" />,
  projects: <FolderGit2 className="h-4 w-4 text-primary" />,
  certifications: <Award className="h-4 w-4 text-primary" />,
  languages: <LanguagesIcon className="h-4 w-4 text-primary" />,
  custom: <Heart className="h-4 w-4 text-primary" />,
};

export function EditorPanel({ data, onChange }: EditorPanelProps) {
  
  const updatePersonalInfo = (info: ResumeData['personalInfo']) => {
    onChange({ ...data, personalInfo: info });
  };

  const updateSection = (sectionId: string, items: SectionItem[]) => {
    const newSections = data.sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, items };
      }
      return section;
    });
    onChange({ ...data, sections: newSections });
  };

  // Group sections by type for better organization
  const experienceSection = data.sections.find(s => s.type === 'experience');
  const educationSection = data.sections.find(s => s.type === 'education');
  const skillsSection = data.sections.find(s => s.type === 'skills');
  
  // Other sections (projects, certifications, languages, custom)
  const otherSections = data.sections.filter(s => 
    !['experience', 'education', 'skills'].includes(s.type)
  );

  const getIcon = (type: string) => sectionIcons[type] || <LayoutList className="h-4 w-4 text-primary" />;

  return (
    <Accordion type="single" collapsible defaultValue="personal" className="w-full">
      {/* Personal Information - Always first */}
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

      {/* Experience */}
      {experienceSection && (
        <AccordionItem value="experience">
          <AccordionTrigger className="hover:no-underline px-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>{experienceSection.title || 'Experience'}</span>
              <span className="text-xs text-muted-foreground ml-auto mr-2">
                ({experienceSection.items.length})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2">
            <ExperienceForm 
              items={experienceSection.items} 
              onChange={(items) => updateSection(experienceSection.id, items)} 
            />
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Education */}
      {educationSection && (
        <AccordionItem value="education">
          <AccordionTrigger className="hover:no-underline px-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>{educationSection.title || 'Education'}</span>
              <span className="text-xs text-muted-foreground ml-auto mr-2">
                ({educationSection.items.length})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2">
            <EducationForm 
              items={educationSection.items} 
              onChange={(items) => updateSection(educationSection.id, items)} 
            />
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Skills */}
      {skillsSection && (
        <AccordionItem value="skills">
          <AccordionTrigger className="hover:no-underline px-2">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              <span>{skillsSection.title || 'Skills'}</span>
              <span className="text-xs text-muted-foreground ml-auto mr-2">
                ({skillsSection.items.length})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2">
            <SkillsForm 
              items={skillsSection.items} 
              onChange={(items) => updateSection(skillsSection.id, items)} 
            />
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Other Sections (Projects, Certifications, Languages, Custom) */}
      {otherSections.map(section => (
        <AccordionItem key={section.id} value={section.id}>
          <AccordionTrigger className="hover:no-underline px-2">
            <div className="flex items-center gap-2">
              {getIcon(section.type)}
              <span>{section.title}</span>
              <span className="text-xs text-muted-foreground ml-auto mr-2">
                ({section.items.length})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pt-2">
            {section.type === 'languages' ? (
              <LanguagesForm 
                items={section.items} 
                onChange={(items) => updateSection(section.id, items)} 
              />
            ) : (
              <GenericSectionForm 
                sectionType={section.type}
                sectionTitle={section.title}
                items={section.items} 
                onChange={(items) => updateSection(section.id, items)} 
              />
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
