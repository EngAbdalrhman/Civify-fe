"use client";

import { SectionItem } from '@/features/upload-cv/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

interface SkillsFormProps {
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}

export function SkillsForm({ items = [], onChange }: SkillsFormProps) {
  const [newSkill, setNewSkill] = useState('');
  
  // Skills are stored as a single SectionItem usually, but we support multiple categories
  // For simplicity, we'll assume the first item is the main skills list or create one if none
  const skillsItem = items[0] || {
    id: uuidv4(),
    title: 'Skills',
    items: [], // This structure in types is weird, text based items usually use 'tags' or we create items for categories
    tags: [] // Using tags for flat list
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    const currentTags = skillsItem.items?.map(i => i.title) || []; // Fallback for ResumeData structure variants
    // But ResumeData.SectionItem has tags?: string[]
    
    // Let's use the 'items' array of the section to store individual skills if they need levels,
    // OR we can use a single item with tags. 
    // The previous prompt's type definition: SectionItem has tags?: string[]
    
    // Strategy: treating SectionItem as a "Category" of skills (e.g. Frontend, Backend)
    // If we want a simple flat list, we have one Item called "All Skills" and push to tags.
    
    if (items.length === 0) {
      // Initialize if empty
      const newItem: SectionItem = {
        id: uuidv4(),
        title: 'Technical Skills',
        items: [], // This is typically null/undefined for leaf items
        tags: [newSkill.trim()]
      };
      onChange([newItem]);
    } else {
      // Add to first category or update
      // For now, let's just make it simple: One category
      const firstItem = items[0];
      const updatedTags = [...(firstItem.tags || []), newSkill.trim()];
      
      const updatedItem = { ...firstItem, tags: updatedTags };
      onChange([updatedItem, ...items.slice(1)]);
    }
    setNewSkill('');
  };

  const removeTag = (tagToRemove: string) => {
    if (items.length === 0) return;
    const firstItem = items[0];
    const updatedTags = (firstItem.tags || []).filter(t => t !== tagToRemove);
    onChange([{ ...firstItem, tags: updatedTags }, ...items.slice(1)]);
  };

  return (
    <div className="space-y-6">
       <div className="space-y-2">
        <Label>Add Skills</Label>
        <div className="flex gap-2">
          <Input 
            value={newSkill} 
            onChange={e => setNewSkill(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
            placeholder="e.g. React, Java, AWS"
          />
          <Button onClick={handleAddSkill} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg min-h-[100px]">
        {items.length > 0 && items[0].tags?.map((tag, idx) => (
          <Badge key={idx} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {(!items.length || !items[0].tags?.length) && (
          <div className="text-muted-foreground text-sm flex items-center justify-center w-full">
            No skills added yet
          </div>
        )}
      </div>
    </div>
  );
}
