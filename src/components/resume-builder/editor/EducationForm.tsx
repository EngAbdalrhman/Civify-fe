"use client";

import { SectionItem } from '@/features/upload-cv/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface EducationFormProps {
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}

export function EducationForm({ items = [], onChange }: EducationFormProps) {
  
  const addItem = () => {
    onChange([
      ...items,
      {
        id: uuidv4(),
        title: '',
        subtitle: '',
        date: '',
        location: '',
        isVisible: true
      }
    ]);
  };

  const updateItem = (id: string, field: keyof SectionItem, value: any) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg bg-card/50 space-y-4 relative group">
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/90">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>School / University</Label>
              <Input 
                value={item.title || ''} 
                onChange={e => updateItem(item.id, 'title', e.target.value)} 
                placeholder="Harvard University"
              />
            </div>
            <div className="space-y-2">
              <Label>Degree / Field</Label>
              <Input 
                value={item.subtitle || ''} 
                onChange={e => updateItem(item.id, 'subtitle', e.target.value)} 
                placeholder="BSc Computer Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                value={item.date || ''} 
                onChange={e => updateItem(item.id, 'date', e.target.value)} 
                placeholder="2018 - 2022"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input 
                value={item.location || ''} 
                onChange={e => updateItem(item.id, 'location', e.target.value)} 
                placeholder="Cambridge, MA"
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addItem} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </Button>
    </div>
  );
}
