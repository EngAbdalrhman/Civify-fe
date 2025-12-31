"use client";

import { useState } from 'react';
import { SectionItem } from '@/features/upload-cv/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface LanguagesFormProps {
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}

const LANGUAGE_LEVELS = [
  { value: 'native', label: 'Native' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'none', label: 'None' },
];

export function LanguagesForm({ items = [], onChange }: LanguagesFormProps) {
  const [newLanguage, setNewLanguage] = useState('');
  const [newLevel, setNewLevel] = useState('intermediate');

  const addLanguage = () => {
    if (!newLanguage.trim()) return;
    
    const newItem: SectionItem = {
      id: uuidv4(),
      title: newLanguage.trim(),
      subtitle: newLevel, // Store level in subtitle
      tags: [],
      visible: true
    };
    onChange([...items, newItem]);
    setNewLanguage('');
    setNewLevel('intermediate');
  };

  const updateLevel = (id: string, level: string) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, subtitle: level } : item
    ));
  };

  const removeLanguage = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Add new language */}
      <div className="flex gap-2">
        <Input 
          value={newLanguage} 
          onChange={e => setNewLanguage(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
          placeholder="Language name..."
          className="flex-1"
        />
        <Select value={newLevel} onValueChange={setNewLevel}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_LEVELS.map(level => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={addLanguage} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Languages list */}
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className="p-3">
            <div className="flex items-center gap-3">
              <span className="font-medium flex-1">{item.title}</span>
              <Select 
                value={item.subtitle || 'intermediate'} 
                onValueChange={(value) => updateLevel(item.id, value)}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLanguage(item.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="text-muted-foreground text-sm text-center py-8 bg-muted/30 rounded-lg">
            No languages added yet
          </div>
        )}
      </div>
    </div>
  );
}
