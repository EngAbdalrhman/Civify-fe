"use client";

import { SectionItem } from '@/features/upload-cv/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

interface SkillsFormProps {
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}

export function SkillsForm({ items = [], onChange }: SkillsFormProps) {
  const [newSkill, setNewSkill] = useState('');
  
  // Get all skill names from items - each item.title is a skill
  const getSkillNames = (): string[] => {
    const skills: string[] = [];
    items.forEach(item => {
      // If item has tags, add them
      if (item.tags && item.tags.length > 0) {
        skills.push(...item.tags);
      } else if (item.title) {
        // Otherwise, the title IS the skill
        skills.push(item.title);
      }
    });
    return skills;
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    // Add as a new SectionItem with title = skill name
    const newItem: SectionItem = {
      id: uuidv4(),
      title: newSkill.trim(),
      tags: [],
      visible: true
    };
    onChange([...items, newItem]);
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    // Remove item by title or from tags
    const updatedItems = items.filter(item => {
      if (item.tags && item.tags.length > 0) {
        // Filter out from tags
        const newTags = item.tags.filter(t => t !== skillToRemove);
        if (newTags.length !== item.tags.length) {
          item.tags = newTags;
          return item.tags.length > 0; // Keep item if still has tags
        }
        return true;
      }
      // Remove item if title matches
      return item.title !== skillToRemove;
    });
    onChange(updatedItems);
  };

  const skills = getSkillNames();

  return (
    <div className="space-y-6">
       <div className="space-y-2">
        <Label>Add Skills</Label>
        <div className="flex gap-2">
          <Input 
            value={newSkill} 
            onChange={e => setNewSkill(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            placeholder="e.g. React, Java, AWS"
          />
          <Button onClick={handleAddSkill} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg min-h-[100px]">
        {skills.map((skill, idx) => (
          <Badge key={`${skill}-${idx}`} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
            {skill}
            <button onClick={() => removeSkill(skill)} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {skills.length === 0 && (
          <div className="text-muted-foreground text-sm flex items-center justify-center w-full">
            No skills added yet
          </div>
        )}
      </div>
    </div>
  );
}
