'use client';

import type { ChangeEvent } from 'react';
import type { FormData } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface Step3JobDetailsProps {
  nextStep: () => void;
  prevStep: () => void;
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function Step3JobDetails({ nextStep, prevStep, formData, updateFormData }: Step3JobDetailsProps) {
  
  const handleJobDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({ jobDescription: e.target.value });
  };

  const handleCoverLetterChange = (checked: boolean) => {
    updateFormData({ generateCoverLetter: checked });
  };
  
  const isGenerateDisabled = !formData.jobDescription.trim();

  return (
    <Card className="shadow-lg rounded-2xl animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Job Details</CardTitle>
        <CardDescription>
          Paste the job description for the role you're applying for. This is crucial for tailoring your CV.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-6">
          <div>
            <Label htmlFor="jobDescription" className="text-base font-medium">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description here..."
              value={formData.jobDescription}
              onChange={handleJobDescriptionChange}
              className="mt-2 min-h-[250px]"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="generateCoverLetter" 
              checked={formData.generateCoverLetter}
              onCheckedChange={handleCoverLetterChange}
            />
            <Label htmlFor="generateCoverLetter">Also generate a Cover Letter?</Label>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={prevStep}>Back</Button>
            <Button onClick={nextStep} disabled={isGenerateDisabled} size="lg">
              Generate Documents
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
