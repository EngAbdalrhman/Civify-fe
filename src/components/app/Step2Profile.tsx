'use client';

import type { ChangeEvent } from 'react';
import type { FormData } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Step2ProfileProps {
  nextStep: () => void;
  prevStep: () => void;
  formData: FormData;
  updateProfileData: (data: Partial<FormData['profile']>) => void;
  updateFormData: (data: Partial<FormData>) => void;
  resetData: () => void;
}

export default function Step2Profile({ nextStep, prevStep, formData, updateProfileData, updateFormData, resetData }: Step2ProfileProps) {
  
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateProfileData({ [e.target.name]: e.target.value });
  };
  
  const handleCvTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({ rawCvText: e.target.value });
  };
  
  return (
    <Card className="shadow-lg rounded-2xl animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Your Profile</CardTitle>
        <CardDescription>
          We've extracted text from <strong className="text-primary">{formData.cvFileName || 'your CV'}</strong>. 
          Please review, paste your full CV text, and fill in the details below.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-6">
          <div>
            <Label htmlFor="rawCvText" className="text-base font-medium">Your CV Text</Label>
            <Textarea
              id="rawCvText"
              name="rawCvText"
              placeholder="Paste the full text from your CV here. This will be used to tailor your new resume."
              value={formData.rawCvText}
              onChange={handleCvTextChange}
              className="mt-2 min-h-[150px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.profile.name} onChange={handleProfileChange} placeholder="e.g., Jane Doe" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.profile.email} onChange={handleProfileChange} placeholder="e.g., jane.doe@email.com" className="mt-2" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={formData.profile.phone} onChange={handleProfileChange} placeholder="e.g., (123) 456-7890" className="mt-2" />
          </div>

          <div>
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea id="summary" name="summary" value={formData.profile.summary} onChange={handleProfileChange} placeholder="A brief summary of your career." className="mt-2 min-h-[100px]" />
          </div>
          <div>
            <Label htmlFor="experience">Work Experience</Label>
            <Textarea id="experience" name="experience" value={formData.profile.experience} onChange={handleProfileChange} placeholder="List your previous roles and responsibilities." className="mt-2 min-h-[150px]" />
          </div>
          <div>
            <Label htmlFor="education">Education</Label>
            <Textarea id="education" name="education" value={formData.profile.education} onChange={handleProfileChange} placeholder="Your degrees and certifications." className="mt-2" />
          </div>
          <div>
            <Label htmlFor="skills">Skills</Label>
            <Textarea id="skills" name="skills" value={formData.profile.skills} onChange={handleProfileChange} placeholder="e.g., React, Project Management, Public Speaking" className="mt-2" />
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button variant="destructive" onClick={resetData}>Reset All Data</Button>
            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep} size="lg">Next Step</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
