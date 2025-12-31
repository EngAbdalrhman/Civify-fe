"use client";

import { ResumeData, SkillsDisplayStyle, LanguagesDisplayStyle, CoursesDisplayStyle } from '@/features/upload-cv/types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LayoutTemplate, Type, Palette, Code, Languages, BookOpen } from 'lucide-react';

interface DesignPanelProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const TEMPLATES = [
  { id: 'modern', name: 'Modern', description: 'Clean and professional' },
  { id: 'classic', name: 'Classic', description: 'Timeless and traditional' },
  { id: 'creative', name: 'Creative', description: 'Bold and standout' },
];

const FONTS = [
  { id: 'Inter', name: 'Inter (Sans)' },
  { id: 'Georgia', name: 'Georgia (Serif)' },
  { id: 'Roboto', name: 'Roboto (Sans)' },
];

const COLORS = [
  '#000000', // Black
  '#2563eb', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#9333ea', // Purple
  '#f59e0b', // Amber
];

const SKILLS_DISPLAY_STYLES: { id: SkillsDisplayStyle; name: string }[] = [
  { id: 'tags', name: 'Tags' },
  { id: 'level', name: 'Level' },
  { id: 'dots', name: 'Dots' },
  { id: 'bar', name: 'Bar' },
];

const LANGUAGES_DISPLAY_STYLES: { id: LanguagesDisplayStyle; name: string }[] = [
  { id: 'level', name: 'Level' },
  { id: 'dots', name: 'Dots' },
  { id: 'bar', name: 'Bar' },
];

const COURSES_DISPLAY_STYLES: { id: CoursesDisplayStyle; name: string; desc: string }[] = [
  { id: 'detailed', name: 'Detailed', desc: 'Full cards' },
  { id: 'simple', name: 'Simple', desc: 'Bullet list' },
];

export function DesignPanel({ data, onChange }: DesignPanelProps) {
  const metadata = data.metadata || {};

  const updateMetadata = (key: string, value: string) => {
    onChange({
      ...data,
      metadata: {
        ...metadata,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Templates */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4" />
          Template
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all
                ${metadata.templateId === template.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'}
              `}
              onClick={() => updateMetadata('templateId', template.id)}
            >
              <div className="font-medium">{template.name}</div>
              <div className="text-sm text-muted-foreground">{template.description}</div>
            </div>
          ))}
        </div>
      </div>

       {/* Colors */}
       <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Accent Color
        </h3>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => (
            <button
              key={color}
              className={`
                w-8 h-8 rounded-full border-2 transition-all ring-offset-background
                ${metadata.primaryColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}
              `}
              style={{ backgroundColor: color, borderColor: color }}
              onClick={() => updateMetadata('primaryColor', color)}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Fonts */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
           <Type className="h-4 w-4" />
           Typography
        </h3>
        <RadioGroup 
          value={metadata.fontFamily || 'Inter'} 
          onValueChange={(val) => updateMetadata('fontFamily', val)}
        >
          {FONTS.map((font) => (
            <div key={font.id} className="flex items-center space-x-2">
              <RadioGroupItem value={font.id} id={`font-${font.id}`} />
              <Label htmlFor={`font-${font.id}`}>{font.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Skills Display Style */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Code className="h-4 w-4" />
          Skills Display
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {SKILLS_DISPLAY_STYLES.map((style) => (
            <button
              key={style.id}
              className={`
                px-3 py-2 text-sm rounded-lg border transition-all
                ${(metadata.skillsDisplayStyle || 'tags') === style.id
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:border-primary/50'}
              `}
              onClick={() => updateMetadata('skillsDisplayStyle', style.id)}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* Languages Display Style */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Languages className="h-4 w-4" />
          Languages Display
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {LANGUAGES_DISPLAY_STYLES.map((style) => (
            <button
              key={style.id}
              className={`
                px-3 py-2 text-sm rounded-lg border transition-all
                ${(metadata.languagesDisplayStyle || 'level') === style.id
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:border-primary/50'}
              `}
              onClick={() => updateMetadata('languagesDisplayStyle', style.id)}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Display Style */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Courses / Certifications Display
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {COURSES_DISPLAY_STYLES.map((style) => (
            <button
              key={style.id}
              className={`
                px-3 py-2 text-sm rounded-lg border transition-all text-left
                ${(metadata.coursesDisplayStyle || 'detailed') === style.id
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:border-primary/50'}
              `}
              onClick={() => updateMetadata('coursesDisplayStyle', style.id)}
            >
              <div className="font-medium">{style.name}</div>
              <div className="text-xs text-muted-foreground">{style.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
