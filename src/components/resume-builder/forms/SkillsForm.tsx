'use client';

import React, { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { ResumeSection, SectionItem } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, GripVertical } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SkillsFormProps {
  section: ResumeSection;
}

const SkillsForm: React.FC<SkillsFormProps> = ({ section }) => {
  const { updateSection, reorderSections, resumeData } = useResume();
  const [newSkill, setNewSkill] = useState("");
  const [newLevel, setNewLevel] = useState("Intermediate");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);

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

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    const newItem: SectionItem = {
      id: `skill-${Date.now()}`,
      title: newSkill,
      subtitle: newLevel, // Storing level in subtitle
      date: '',
      description: '',
      location: '',
      tags: [],
      isVisible: true,
    };

    updateSection(section.id, {
      items: [...section.items, newItem],
    });
    setNewSkill("");
  };

  const handleRemoveSkill = (itemId: string) => {
    updateSection(section.id, {
      items: section.items.filter((item) => item.id !== itemId),
    });
  };

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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
          <div className="w-[140px] space-y-2">
            <Label>Display Style</Label>
            <Select 
              value={section.style || 'dots'} 
              onValueChange={(val) => updateSection(section.id, { style: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dots">Dots</SelectItem>
                <SelectItem value="bar">Progress Bar</SelectItem>
                <SelectItem value="text">Text Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-2">
            <Label>Skill Name</Label>
            <Input 
              value={newSkill} 
              onChange={(e) => setNewSkill(e.target.value)} 
              placeholder="e.g. React, Java, Leadership"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
            />
          </div>
          <div className="w-[140px] space-y-2">
            <Label>Level</Label>
            <Select value={newLevel} onValueChange={setNewLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddSkill} size="icon" className="mb-0.5">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {section.items.map((item) => (
            <Badge key={item.id} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-2 text-sm">
              <div className="flex flex-col items-start">
                <span className="font-semibold">{item.title}</span>
                <span className="text-[10px] text-gray-500 font-normal">{item.subtitle}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 rounded-full hover:bg-gray-300 ml-1"
                onClick={() => handleRemoveSkill(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        
        {section.items.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
                No skills added yet.
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillsForm;
