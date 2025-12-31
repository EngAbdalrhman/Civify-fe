"use client";

import { useState } from 'react';
import { SectionItem } from '@/features/upload-cv/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';

interface GenericSectionFormProps {
  sectionType: string;
  sectionTitle?: string; // Pass title for better detection
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}

export function GenericSectionForm({ sectionType, sectionTitle = '', items, onChange }: GenericSectionFormProps) {
  const [newItemTitle, setNewItemTitle] = useState('');

  // Determine section characteristics by type AND title
  const lowerTitle = sectionTitle.toLowerCase();
  const lowerType = sectionType.toLowerCase();
  
  // Simple sections: just need title - Interests, Hobbies, simple lists
  const isSimpleSection = 
    lowerType === 'interests' ||
    lowerTitle.includes('interest') || 
    lowerTitle.includes('hobby') ||
    lowerTitle.includes('hobbies');
    
  // Complex sections need more fields
  const isProjectSection = lowerType === 'projects' || lowerTitle.includes('project');
  const isCertSection = lowerType === 'certifications' || lowerTitle.includes('course') || lowerTitle.includes('certif');
  const isActivitySection = lowerTitle.includes('activit') || lowerTitle.includes('volunteer');
  
  const showSubtitle = isProjectSection || isCertSection || isActivitySection;
  const showDates = isProjectSection || isCertSection || isActivitySection;
  const showDescription = isProjectSection || isActivitySection;

  const addItem = () => {
    if (!newItemTitle.trim()) return;
    
    const newItem: SectionItem = {
      id: uuidv4(),
      title: newItemTitle.trim(),
      subtitle: '',
      startDate: '',
      endDate: '',
      date: '',
      description: '',
      location: '',
      tags: [],
      visible: true,
    };
    onChange([...items, newItem]);
    setNewItemTitle('');
  };

  const updateItem = (id: string, updates: Partial<SectionItem>) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  // For simple sections, render as tags
  if (isSimpleSection) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Add Item</Label>
          <div className="flex gap-2">
            <Input 
              value={newItemTitle} 
              onChange={e => setNewItemTitle(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())}
              placeholder="e.g. Reading, Chess, Photography..."
            />
            <Button onClick={addItem} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg min-h-[80px]">
          {items.map((item) => (
            <Badge key={item.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {item.title}
              <button onClick={() => removeItem(item.id)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {items.length === 0 && (
            <div className="text-muted-foreground text-sm flex items-center justify-center w-full">
              No items added yet
            </div>
          )}
        </div>
      </div>
    );
  }

  // For complex sections, render cards with date pickers
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GripVertical className="h-4 w-4 cursor-grab" />
                <span>Item {index + 1}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-3">
              <div>
                <Label className="text-xs">Title *</Label>
                <Input
                  value={item.title || ''}
                  onChange={(e) => updateItem(item.id, { title: e.target.value })}
                  placeholder="e.g., Project Name, Course Title..."
                  className="h-9"
                />
              </div>

              {showSubtitle && (
                <div>
                  <Label className="text-xs">Subtitle / Organization</Label>
                  <Input
                    value={item.subtitle || ''}
                    onChange={(e) => updateItem(item.id, { subtitle: e.target.value })}
                    placeholder="e.g., Role, Organization..."
                    className="h-9"
                  />
                </div>
              )}

              {showDates && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="month"
                      value={item.startDate || ''}
                      onChange={(e) => updateItem(item.id, { 
                        startDate: e.target.value,
                        date: `${e.target.value} - ${item.endDate || 'Present'}`
                      })}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="month"
                        value={item.endDate || ''}
                        onChange={(e) => updateItem(item.id, { 
                          endDate: e.target.value,
                          date: `${item.startDate || ''} - ${e.target.value || 'Present'}`
                        })}
                        className="h-9 flex-1"
                        disabled={item.endDate === 'Present'}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Checkbox 
                        id={`present-${item.id}`}
                        checked={item.endDate === 'Present'}
                        onCheckedChange={(checked) => {
                          const endDate = checked ? 'Present' : '';
                          updateItem(item.id, { 
                            endDate,
                            date: `${item.startDate || ''} - ${endDate || 'Present'}`
                          });
                        }}
                      />
                      <Label htmlFor={`present-${item.id}`} className="text-xs text-muted-foreground">
                        Present / Ongoing
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {showDescription && (
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={item.description || ''}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    placeholder="Brief description..."
                    className="min-h-[60px] resize-none"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Input 
          value={newItemTitle} 
          onChange={e => setNewItemTitle(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())}
          placeholder="New item title..."
          className="flex-1"
        />
        <Button onClick={addItem} className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
