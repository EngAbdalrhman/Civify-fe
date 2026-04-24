"use client";

import { SectionItem } from '@/features/upload-cv/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { MonthPicker } from '@/components/ui/MonthPicker';
import { Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface EducationFormProps {
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}

import { useTranslations } from 'next-intl';

export function EducationForm({ items = [], onChange }: EducationFormProps) {
  const t = useTranslations('editor.education');
  
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

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.id} className={`p-4 border rounded-lg bg-card/50 space-y-4 relative group transition-opacity ${item.visible === false ? 'opacity-50' : ''}`}>
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex">
            <Button variant="ghost" size="icon" onClick={() => updateItem(item.id, { visible: item.visible === false ? true : false })} className="text-muted-foreground hover:text-foreground">
              {item.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/90">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>{t('school')}</Label>
              <Input 
                value={item.subtitle || ''} 
                onChange={e => updateItem(item.id, { subtitle: e.target.value })} 
                placeholder={t('schoolPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('degree')}</Label>
              <Input 
                value={item.title || ''} 
                onChange={e => updateItem(item.id, { title: e.target.value })} 
                placeholder={t('degreePlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('startDate')}</Label>
              <MonthPicker 
                value={item.startDate || ''} 
                onChange={value => updateDates(item.id, value, item.endDate || '')} 
                placeholder={t('startDate')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('endDate')}</Label>
              <MonthPicker 
                value={item.endDate === 'Present' ? '' : (item.endDate || '')} 
                onChange={value => updateDates(item.id, item.startDate || '', value)} 
                disabled={item.endDate === 'Present'}
                placeholder={t('endDate')}
              />
              <div className="mt-2 flex items-start gap-2 pl-0.5">
                <Checkbox 
                  id={`present-edu-${item.id}`}
                  checked={item.endDate === 'Present'}
                  onCheckedChange={(checked) => {
                    updateDates(item.id, item.startDate || '', checked ? 'Present' : '');
                  }}
                />
                <Label htmlFor={`present-edu-${item.id}`} className="cursor-pointer pt-0.5 text-xs leading-none text-muted-foreground">
                  {t('present')}
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('location')}</Label>
            <Input 
              value={item.location || ''} 
              onChange={e => updateItem(item.id, { location: e.target.value })} 
              placeholder={t('locationPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('gpa')}</Label>
            <Input 
              value={item.description || ''} 
              onChange={e => updateItem(item.id, { description: e.target.value })} 
              placeholder={t('gpaPlaceholder')}
            />
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addItem} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" />
        {t('add')}
      </Button>
    </div>
  );
}
