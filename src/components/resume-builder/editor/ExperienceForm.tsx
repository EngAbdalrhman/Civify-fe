"use client";

import { SectionItem } from '@/features/upload-cv/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ExperienceFormProps {
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}

export function ExperienceForm({ items = [], onChange }: ExperienceFormProps) {
  
  const addItem = () => {
    onChange([
      ...items,
      {
        id: uuidv4(),
        title: '',
        subtitle: '',
        startDate: '',
        endDate: '',
        date: '',
        description: '',
        location: '',
        visible: true
      }
    ]);
  };

  const updateItem = (id: string, updates: Partial<SectionItem>) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const updateDates = (id: string, startDate: string, endDate: string) => {
    const dateStr = endDate === 'Present' 
      ? `${startDate} - Present` 
      : (startDate && endDate) 
        ? `${startDate} - ${endDate}` 
        : startDate || endDate;
    updateItem(id, { startDate, endDate, date: dateStr });
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const isPresent = (item: SectionItem) => item.endDate === 'Present' || (!item.endDate && !item.startDate);

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
              <Label>Company Name</Label>
              <Input 
                value={item.title || ''} 
                onChange={e => updateItem(item.id, { title: e.target.value })} 
                placeholder="Company Inc."
              />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input 
                value={item.subtitle || ''} 
                onChange={e => updateItem(item.id, { subtitle: e.target.value })} 
                placeholder="Senior Developer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>Start Date</Label>
              <Input 
                type="month"
                value={item.startDate || ''} 
                onChange={e => updateDates(item.id, e.target.value, item.endDate || '')} 
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input 
                type="month"
                value={item.endDate === 'Present' ? '' : (item.endDate || '')} 
                onChange={e => updateDates(item.id, item.startDate || '', e.target.value)} 
                disabled={item.endDate === 'Present'}
              />
              <div className="flex items-center gap-2 mt-1">
                <Checkbox 
                  id={`present-${item.id}`}
                  checked={item.endDate === 'Present'}
                  onCheckedChange={(checked) => {
                    updateDates(item.id, item.startDate || '', checked ? 'Present' : '');
                  }}
                />
                <Label htmlFor={`present-${item.id}`} className="text-xs text-muted-foreground cursor-pointer">
                  Present / Current
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input 
              value={item.location || ''} 
              onChange={e => updateItem(item.id, { location: e.target.value })} 
              placeholder="Remote / City, Country"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={item.description || ''} 
              onChange={e => updateItem(item.id, { description: e.target.value })} 
              placeholder="• Achieved X results..."
              className="min-h-[100px]"
            />
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addItem} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" />
        Add Experience
      </Button>
    </div>
  );
}
