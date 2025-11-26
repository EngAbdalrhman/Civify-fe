'use client';

import React from 'react';
import { useResume } from '@/context/ResumeContext';
import { ResumeSection, SectionItem } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import DatePicker from './DatePicker';
import SkillsForm from './SkillsForm';

interface SectionFormProps {
  section: ResumeSection;
}

const SectionForm: React.FC<SectionFormProps> = ({ section }) => {
  const { updateSection, reorderSections, resumeData } = useResume();
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(section.title);

  const handleAddItem = () => {
    const newItem: SectionItem = {
      id: `item-${Date.now()}`,
      title: '',
      subtitle: '',
      date: '',
      description: '',
      location: '',
      tags: [],
      isVisible: true,
    };
    updateSection(section.id, {
      items: [...section.items, newItem],
    });
  };

  const handleRemoveItem = (itemId: string) => {
    updateSection(section.id, {
      items: section.items.filter((item) => item.id !== itemId),
    });
  };

  const handleItemChange = (itemId: string, field: keyof SectionItem, value: string) => {
    updateSection(section.id, {
      items: section.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleSaveTitle = () => {
    updateSection(section.id, { title: editedTitle });
    setIsEditingTitle(false);
  };

  const handleMoveUp = () => {
    const index = resumeData.sections.findIndex(s => s.id === section.id);
    if (index > 0) {
      reorderSections(index, index - 1);
    }
  };

  const handleMoveDown = () => {
    const index = resumeData.sections.findIndex(s => s.id === section.id);
    if (index < resumeData.sections.length - 1) {
      reorderSections(index, index + 1);
    }
  };

  if (section.type === 'skills') {
    return <SkillsForm section={section} />;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input 
                value={editedTitle} 
                onChange={(e) => setEditedTitle(e.target.value)}
                className="h-8 w-[200px]"
              />
              <Button size="sm" onClick={handleSaveTitle}>Save</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingTitle(true)}>
                <GripVertical className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMoveUp}>
            <span className="sr-only">Move Up</span>
            ↑
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMoveDown}>
            <span className="sr-only">Move Down</span>
            ↓
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {section.items.map((item, index) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {item.title || '(New Item)'}
                  </span>
                  {item.subtitle && <span className="text-gray-500">- {item.subtitle}</span>}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-4 p-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title {section.type === 'education' ? '(School)' : '(Company)'}</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                        placeholder={section.type === 'education' ? 'University Name' : 'Company Name'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle {section.type === 'education' ? '(Degree)' : '(Role)'}</Label>
                      <Input
                        value={item.subtitle}
                        onChange={(e) => handleItemChange(item.id, 'subtitle', e.target.value)}
                         placeholder={section.type === 'education' ? 'Bachelor of Science' : 'Senior Developer'}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <Label>Date Range</Label>
                      <DatePicker
                        value={item.date}
                        onChange={(value) => handleItemChange(item.id, 'date', value)}
                      />
                    </div>
                     <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={item.location}
                        onChange={(e) => handleItemChange(item.id, 'location', e.target.value)}
                        placeholder="New York, NY"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Describe your responsibilities and achievements..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {section.items.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
                No items added yet. Click "Add Item" to start.
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SectionForm;
