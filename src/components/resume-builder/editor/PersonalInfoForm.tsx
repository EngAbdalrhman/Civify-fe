"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ResumeData } from '@/features/upload-cv/types';

interface PersonalInfoFormProps {
  data: ResumeData['personalInfo'];
  onChange: (data: ResumeData['personalInfo']) => void;
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const handleChange = (field: keyof ResumeData['personalInfo'], value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input 
            value={data.fullName || ''} 
            onChange={e => handleChange('fullName', e.target.value)} 
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label>Job Title</Label>
          <Input 
            value={data.jobTitle || ''} 
            onChange={e => handleChange('jobTitle', e.target.value)} 
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input 
            value={data.email || ''} 
            onChange={e => handleChange('email', e.target.value)} 
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input 
            value={data.phone || ''} 
            onChange={e => handleChange('phone', e.target.value)} 
            placeholder="+1 234 567 890"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Address / Location</Label>
        <Input 
          value={data.address || ''} 
          onChange={e => handleChange('address', e.target.value)} 
          placeholder="New York, NY"
        />
      </div>

      <div className="space-y-2">
        <Label>Summary</Label>
        <Textarea 
          value={data.summary || ''} 
          onChange={e => handleChange('summary', e.target.value)} 
          placeholder="Brief professional summary..."
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>LinkedIn</Label>
          <Input 
            value={data.linkedin || ''} 
            onChange={e => handleChange('linkedin', e.target.value)} 
            placeholder="linkedin.com/in/johndoe"
          />
        </div>
        <div className="space-y-2">
          <Label>GitHub</Label>
          <Input 
            value={data.github || ''} 
            onChange={e => handleChange('github', e.target.value)} 
            placeholder="github.com/johndoe"
          />
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input 
            value={data.website || ''} 
            onChange={e => handleChange('website', e.target.value)} 
            placeholder="johndoe.com"
          />
        </div>
      </div>
    </div>
  );
}
