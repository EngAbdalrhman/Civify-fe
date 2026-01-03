"use client";

import { SectionItem, SkillLevel } from '@/features/upload-cv/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

interface SkillsFormProps {
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}

import { useTranslations } from 'next-intl';

const SKILL_LEVELS: { value: SkillLevel; labelKey: string }[] = [
  { value: 'expert', labelKey: 'expert' },
  { value: 'advanced', labelKey: 'advanced' },
  { value: 'intermediate', labelKey: 'intermediate' },
  { value: 'beginner', labelKey: 'beginner' },
];

export function SkillsForm({ items = [], onChange }: SkillsFormProps) {
  const t = useTranslations('editor.skills');
  const tLevels = useTranslations('resume.levels');
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState<SkillLevel>('intermediate');
  
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    const newItem: SectionItem = {
      id: uuidv4(),
      title: newSkill.trim(),
      level: newLevel,
      tags: [],
      visible: true
    };
    onChange([...items, newItem]);
    setNewSkill('');
    setNewLevel('intermediate');
  };

  const updateLevel = (id: string, level: SkillLevel) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, level } : item
    ));
  };

  const removeSkill = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Add new skill */}
      <div className="flex gap-2">
        <Input 
          value={newSkill} 
          onChange={e => setNewSkill(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
          placeholder={t('addPlaceholder')}
          className="flex-1"
        />
        <Select value={newLevel} onValueChange={(v) => setNewLevel(v as SkillLevel)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SKILL_LEVELS.map(level => (
              <SelectItem key={level.value} value={level.value}>
                {tLevels(level.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAddSkill} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Skills list */}
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className="p-3">
            <div className="flex items-center gap-3">
              <span className="font-medium flex-1">{item.title}</span>
              <Select 
                value={item.level || 'intermediate'} 
                onValueChange={(value) => updateLevel(item.id, value as SkillLevel)}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {tLevels(level.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSkill(item.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="text-muted-foreground text-sm text-center py-8 bg-muted/30 rounded-lg">
            {t('noItems')}
          </div>
        )}
      </div>
    </div>
  );
}
