'use client';

import React from 'react';
import { useResume } from '@/context/ResumeContext';
import PersonalForm from './forms/PersonalForm';
import SectionForm from './forms/SectionForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ResumeForm = () => {
  const { resumeData, addSection } = useResume();

  return (
    <div className="space-y-6 pb-20">
      <PersonalForm />
      
      {resumeData.sections.map((section) => (
        <SectionForm key={section.id} section={section} />
      ))}

      <div className="flex justify-center pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => addSection('experience')}>Experience</DropdownMenuItem>
            <DropdownMenuItem onClick={() => addSection('education')}>Education</DropdownMenuItem>
            <DropdownMenuItem onClick={() => addSection('skills')}>Skills</DropdownMenuItem>
            <DropdownMenuItem onClick={() => addSection('projects')}>Projects</DropdownMenuItem>
            <DropdownMenuItem onClick={() => addSection('certifications')}>Certifications</DropdownMenuItem>
            <DropdownMenuItem onClick={() => addSection('custom')}>Custom Section</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ResumeForm;
