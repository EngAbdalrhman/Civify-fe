"use client";

import { useState } from 'react';
import { SectionItem } from '@/features/upload-cv/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GenericSectionFormProps {
  sectionType: string;
  sectionTitle?: string;
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}

// Parse legacy date format
function parseLegacyDate(dateStr?: string): { startDate: string; endDate: string } {
  if (!dateStr) return { startDate: '', endDate: '' };
  const separators = [' – ', ' - ', '–', '-'];
  let parts: string[] = [];
  for (const sep of separators) {
    if (dateStr.includes(sep)) {
      parts = dateStr.split(sep).map(p => p.trim());
      break;
    }
  }
  if (parts.length !== 2) return { startDate: '', endDate: '' };
  const [start, end] = parts;
  const convertDate = (d: string): string => {
    if (d.toLowerCase() === 'present') return 'Present';
    const match = d.match(/^(\d{2})\/(\d{4})$/);
    if (match) return `${match[2]}-${match[1]}`;
    return d;
  };
  return { startDate: convertDate(start), endDate: convertDate(end) };
}

// Sortable Item Component
function SortableGenericItem({ 
  item, 
  index,
  showSubtitle,
  showDates,
  showDescription,
  updateItem, 
  removeItem 
}: { 
  item: SectionItem;
  index: number;
  showSubtitle: boolean;
  showDates: boolean;
  showDescription: boolean;
  updateItem: (id: string, updates: Partial<SectionItem>) => void;
  removeItem: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const t = useTranslations('editor.generic');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const displayStartDate = item.startDate || parseLegacyDate(item.date).startDate;
  const displayEndDate = item.endDate || parseLegacyDate(item.date).endDate;
  const isPresent = displayEndDate === 'Present';

  const updateDates = (startDate: string, endDate: string) => {
    const dateStr = endDate === 'Present' 
      ? `${startDate} - Present` 
      : (startDate && endDate) 
        ? `${startDate} - ${endDate}` 
        : startDate || endDate;
    updateItem(item.id, { startDate, endDate, date: dateStr });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div 
              {...attributes}
              {...listeners}
              className="flex items-center gap-2 text-sm text-muted-foreground cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
              <span>{t('item')} {index + 1}</span>
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
              <Label className="text-xs">{t('title')}</Label>
              <Input
                value={item.title || ''}
                onChange={(e) => updateItem(item.id, { title: e.target.value })}
                placeholder={t('titlePlaceholder')}
                className="h-9"
              />
            </div>

            {showSubtitle && (
              <div>
                <Label className="text-xs">{t('subtitle')}</Label>
                <Input
                  value={item.subtitle || ''}
                  onChange={(e) => updateItem(item.id, { subtitle: e.target.value })}
                  placeholder={t('subtitlePlaceholder')}
                  className="h-9"
                />
              </div>
            )}

            {showDates && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">{t('startDate')}</Label>
                  <Input
                    type="month"
                    value={displayStartDate !== 'Present' ? displayStartDate : ''}
                    onChange={(e) => updateDates(e.target.value, displayEndDate)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t('endDate')}</Label>
                  <Input
                    type="month"
                    value={isPresent ? '' : displayEndDate}
                    onChange={(e) => updateDates(displayStartDate, e.target.value)}
                    className="h-9"
                    disabled={isPresent}
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <Checkbox 
                      id={`present-${item.id}`}
                      checked={isPresent}
                      onCheckedChange={(checked) => {
                        updateDates(displayStartDate, checked ? 'Present' : '');
                      }}
                    />
                    <Label htmlFor={`present-${item.id}`} className="text-xs text-muted-foreground">
                      {t('present')}
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {showDescription && (
              <div>
                <Label className="text-xs">{t('description')}</Label>
                <Textarea
                  value={item.description || ''}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder={t('descriptionPlaceholder')}
                  className="min-h-[60px] resize-none"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useTranslations } from 'next-intl';

export function GenericSectionForm({ sectionType, sectionTitle = '', items, onChange }: GenericSectionFormProps) {
  const t = useTranslations('editor.generic');
  const [newItemTitle, setNewItemTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const lowerTitle = sectionTitle.toLowerCase();
  const lowerType = sectionType.toLowerCase();
  
  // Simple sections: just need title
  const isSimpleSection = 
    lowerType === 'interests' ||
    lowerTitle.includes('interest') || 
    lowerTitle.includes('hobby') ||
    lowerTitle.includes('hobbies');
    
  // Complex sections
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  // Simple sections render as tags
  if (isSimpleSection) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t('addItem')}</Label>
          <div className="flex gap-2">
            <Input 
              value={newItemTitle} 
              onChange={e => setNewItemTitle(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())}
              placeholder={t('addSimplePlaceholder')}
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
              {t('noItems')}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Complex sections with drag-drop
  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, index) => (
            <SortableGenericItem
              key={item.id}
              item={item}
              index={index}
              showSubtitle={showSubtitle}
              showDates={showDates}
              showDescription={showDescription}
              updateItem={updateItem}
              removeItem={removeItem}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex gap-2">
        <Input 
          value={newItemTitle} 
          onChange={e => setNewItemTitle(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())}
          placeholder={t('newItemTitle')}
          className="flex-1"
        />
        <Button onClick={addItem} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('add')}
        </Button>
      </div>
    </div>
  );
}
