"use client";

import { ResumeData, SkillsDisplayStyle, LanguagesDisplayStyle, CoursesDisplayStyle } from '@/features/upload-cv/types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LayoutTemplate, Type, Palette, Code, Languages, BookOpen, AlignLeft, AlignRight, Maximize, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

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

import { useTranslations } from 'next-intl';

export function DesignPanel({ data, onChange }: DesignPanelProps) {
  const metadata = data.metadata || {};
  const t = useTranslations('design');

  const updateMetadata = (key: string, value: any) => {
    onChange({
      ...data,
      metadata: {
        ...metadata,
        [key]: value,
      },
    });
  };

  const updateMargins = (key: 'top' | 'bottom' | 'left' | 'right', value: number) => {
    onChange({
      ...data,
      metadata: {
        ...metadata,
        margins: {
          ...(metadata.margins || { top: 40, bottom: 40, left: 40, right: 40 }),
          [key]: value,
        },
      },
    });
  };

  const columnEligibleSections = data.sections.filter(section => {
    if (section.visible === false) return false;
    const lowerTitle = section.title.toLowerCase();
    const isCourse = section.type === 'certifications' || lowerTitle.includes('course') || lowerTitle.includes('certif');
    const isSimpleList = lowerTitle.includes('interest') || lowerTitle.includes('hobb');
    
    // Eligible if it's natively a simple list type, OR if it's a course using simple display style
    const usesSimpleStyle = (metadata.coursesDisplayStyle || 'simple') === 'simple';
    return isSimpleList || (isCourse && usesSimpleStyle);
  });

  const updateSectionColumns = (sectionId: string, columns: number) => {
    onChange({
      ...data,
      metadata: {
        ...metadata,
        sectionColumns: {
          ...(metadata.sectionColumns || {}),
          [sectionId]: columns,
        },
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Templates */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4" />
          {t('template.title')}
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
              <div className="font-medium">{t(`template.${template.id}.name` as any)}</div>
              <div className="text-sm text-muted-foreground">{t(`template.${template.id}.description` as any)}</div>
            </div>
          ))}
        </div>
      </div>

       {/* Colors */}
       <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Palette className="h-4 w-4" />
          {t('colors')}
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
           {t('typography')}
        </h3>
        
        <div className="space-y-6">
          {/* Heading Font */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">{t('headingFont')}</h4>
            <RadioGroup 
              value={metadata.headingFontFamily || metadata.fontFamily || 'Inter'} 
              onValueChange={(val) => updateMetadata('headingFontFamily', val)}
              className="grid grid-cols-3 gap-2"
            >
              {FONTS.map((font) => (
                <div key={`heading-${font.id}`} className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={font.id} id={`heading-font-${font.id}`} />
                  <Label htmlFor={`heading-font-${font.id}`} className="flex-1 cursor-pointer text-xs">{font.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Body Font */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">{t('bodyFont')}</h4>
            <RadioGroup 
              value={metadata.bodyFontFamily || metadata.fontFamily || 'Inter'} 
              onValueChange={(val) => updateMetadata('bodyFontFamily', val)}
              className="grid grid-cols-3 gap-2"
            >
              {FONTS.map((font) => (
                <div key={`body-${font.id}`} className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={font.id} id={`body-font-${font.id}`} />
                  <Label htmlFor={`body-font-${font.id}`} className="flex-1 cursor-pointer text-xs">{font.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Advanced Layout Controls */}
      <div className="space-y-6 border-t pt-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Maximize className="h-4 w-4" />
          Layout & Spacing
        </h3>
        
        {/* Compact Mode */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="compact-mode" className="text-sm">
              {t('compactMode')}
            </Label>
            <p className="text-xs text-muted-foreground">
              Reduce line heights to fit more content.
            </p>
          </div>
          <Switch
            id="compact-mode"
            checked={metadata.compactMode || false}
            onCheckedChange={(val) => updateMetadata('compactMode', val)}
          />
        </div>

        {/* Section & Item Spacing */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="spacing-slider" className="text-sm">
              {t('spacing')}
            </Label>
            <span className="text-xs font-mono text-muted-foreground">
              {metadata.spacingLevel || 3}
            </span>
          </div>
          <input
            id="spacing-slider"
            type="range"
            min="1"
            max="5"
            step="1"
            value={metadata.spacingLevel || 3}
            onChange={(e) => updateMetadata('spacingLevel', parseInt(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
            <span>Tight</span>
            <span>Relaxed</span>
          </div>
        </div>

        {/* Page Margins */}
        <div className="space-y-4">
          <Label className="text-sm block">
            {t('margins.title') || 'Page Margins'}
          </Label>
          <div className="grid grid-cols-2 gap-4">
            {/* Top Margin */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{t('margins.top') || 'Top'}</span>
                <span className="font-mono">{metadata.margins?.top ?? 40}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={metadata.margins?.top ?? 40}
                onChange={(e) => updateMargins('top', parseInt(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            {/* Bottom Margin */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{t('margins.bottom') || 'Bottom'}</span>
                <span className="font-mono">{metadata.margins?.bottom ?? 40}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={metadata.margins?.bottom ?? 40}
                onChange={(e) => updateMargins('bottom', parseInt(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            {/* Left Margin */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{t('margins.left') || 'Left'}</span>
                <span className="font-mono">{metadata.margins?.left ?? 40}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={metadata.margins?.left ?? 40}
                onChange={(e) => updateMargins('left', parseInt(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            {/* Right Margin */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{t('margins.right') || 'Right'}</span>
                <span className="font-mono">{metadata.margins?.right ?? 40}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={metadata.margins?.right ?? 40}
                onChange={(e) => updateMargins('right', parseInt(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Skills Display Style */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Code className="h-4 w-4" />
          {t('sectionStyles.skills')}
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
              {t(`sectionStyles.${style.id}` as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Languages Display Style */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Languages className="h-4 w-4" />
          {t('sectionStyles.languages')}
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
              {t(`sectionStyles.${style.id}` as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Display Style */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          {t('sectionStyles.courses')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {COURSES_DISPLAY_STYLES.map((style) => (
            <button
              key={style.id}
              className={`
                px-3 py-2 text-sm rounded-lg border transition-all text-left
                ${(metadata.coursesDisplayStyle || 'simple') === style.id
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:border-primary/50'}
              `}
              onClick={() => updateMetadata('coursesDisplayStyle', style.id)}
            >
              <div className="font-medium">{t(`sectionStyles.${style.id}.name` as any)}</div>
              <div className="text-xs text-muted-foreground">{t(`sectionStyles.${style.id}.description` as any)}</div>
            </button>
          ))}
        </div>
      </div>

       {/* Layout Direction */}
       <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <AlignLeft className="h-4 w-4" />
          {t('layoutDirection.title')}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`
              px-3 py-2 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-1
              ${(!metadata.layoutDirection || metadata.layoutDirection === 'auto')
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border hover:border-primary/50'}
            `}
            onClick={() => updateMetadata('layoutDirection', 'auto')}
          >
            <span className="font-medium">{t('layoutDirection.auto')}</span>
            <span className="text-[10px] text-muted-foreground">{t('layoutDirection.matchLocale')}</span>
          </button>
           <button
            className={`
              px-3 py-2 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-1
              ${metadata.layoutDirection === 'ltr'
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border hover:border-primary/50'}
            `}
            onClick={() => updateMetadata('layoutDirection', 'ltr')}
          >
            <AlignLeft className="h-3 w-3" />
            <span className="font-medium">{t('layoutDirection.ltr')}</span>
          </button>
           <button
            className={`
              px-3 py-2 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-1
              ${metadata.layoutDirection === 'rtl'
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border hover:border-primary/50'}
            `}
            onClick={() => updateMetadata('layoutDirection', 'rtl')}
          >
            <AlignRight className="h-3 w-3" />
            <span className="font-medium">{t('layoutDirection.rtl')}</span>
          </button>
        </div>
      </div>

      {/* Section Columns */}
      {columnEligibleSections.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            {t('sectionColumns.title') || 'Section Columns'}
          </h3>
          <div className="space-y-3">
            {columnEligibleSections.map(section => {
              const currentCols = metadata.sectionColumns?.[section.id] || 3;
              return (
                <div key={section.id} className="flex items-center justify-between">
                  <Label className="text-sm border-0 font-medium truncate pr-4">{section.title}</Label>
                  <div className="flex gap-1 shrink-0">
                    {[1, 2, 3, 4].map(n => (
                      <button
                        key={n}
                        className={`
                          w-8 h-8 flex items-center justify-center text-xs rounded-md border transition-all
                          ${currentCols === n
                            ? 'bg-primary text-primary-foreground border-primary font-bold'
                            : 'bg-background hover:bg-muted border-border font-medium hover:border-primary/50'}
                        `}
                        onClick={() => updateSectionColumns(section.id, n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
