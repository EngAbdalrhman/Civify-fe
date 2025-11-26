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

interface SectionFormProps {
  section: ResumeSection;
}

const SectionForm: React.FC<SectionFormProps> = ({ section }) => {
  const { updateSection } = useResume();

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

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{section.title}</CardTitle>
        <Button variant="outline" size="sm" onClick={handleAddItem}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
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
                      <Input
                        value={item.date}
                        onChange={(e) => handleItemChange(item.id, 'date', e.target.value)}
                        placeholder="Jan 2020 - Present"
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
