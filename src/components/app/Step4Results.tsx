'use client';

import { useState, useEffect, useRef } from 'react';
import { tailorCv } from '@/ai/flows/cv-tailoring';
import { generateCoverLetter as generateCoverLetterFlow } from '@/ai/flows/cover-letter-generation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader } from './Loader';
import { exportToPdf } from '@/lib/pdf';
import type { FormData } from '@/app/page';
import { Copy } from 'lucide-react';

interface Step4ResultsProps {
  prevStep: () => void;
  formData: FormData;
}

export default function Step4Results({ prevStep, formData }: Step4ResultsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tailoredCv, setTailoredCv] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const { toast } = useToast();

  const cvContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const cvPromise = tailorCv({
          cvText: formData.rawCvText,
          jobDescription: formData.jobDescription,
        });

        const coverLetterPromise = formData.generateCoverLetter
          ? generateCoverLetterFlow({
              jobDescription: formData.jobDescription,
              userProfile: `
                Name: ${formData.profile.name}
                Email: ${formData.profile.email}
                Phone: ${formData.profile.phone}
                Professional Summary: ${formData.profile.summary}
                Work Experience: ${formData.profile.experience}
                Education: ${formData.profile.education}
                Skills: ${formData.profile.skills}
              `,
            })
          : Promise.resolve(null);

        const [cvResult, coverLetterResult] = await Promise.all([cvPromise, coverLetterPromise]);
        
        if (cvResult?.tailoredCv) {
          setTailoredCv(cvResult.tailoredCv);
        } else {
          throw new Error('Failed to generate tailored CV.');
        }

        if (coverLetterResult?.coverLetter) {
          setCoverLetter(coverLetterResult.coverLetter);
        }

      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate documents. ${errorMessage}`);
        toast({
          title: "Generation Failed",
          description: `There was an error generating your documents. ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    generateDocuments();
  }, [formData, toast]);
  
  const handleExport = async () => {
    if (!cvContainerRef.current) {
        toast({ title: 'Error', description: 'Cannot find content to export.', variant: 'destructive' });
        return;
    }
    toast({ title: 'Exporting...', description: 'Your PDF is being generated.' });
    await exportToPdf(cvContainerRef.current, null);
  };

  const handleCopyCoverLetter = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter.replace(/<br \/>/g, '\n').replace(/<br>/g, '\n'));
      toast({
        title: "Copied!",
        description: "Cover letter copied to clipboard.",
      });
    }
  };


  if (loading) {
    return (
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-12">
          <Loader message="AI is crafting your documents..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg rounded-2xl border-destructive">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-destructive">Generation Failed</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={prevStep}>Go Back and Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Your Tailored CV</CardTitle>
            <CardDescription>Review your new AI-optimized curriculum vitae.</CardDescription>
          </div>
          <Button onClick={handleExport} size="lg">
            Export CV as PDF
          </Button>
        </CardHeader>
        <CardContent>
          <div ref={cvContainerRef} className="p-6 md:p-8 bg-white rounded-xl shadow-inner border">
              <div className="resume-output" dangerouslySetInnerHTML={{ __html: tailoredCv }} />
          </div>
        </CardContent>
      </Card>

      {formData.generateCoverLetter && coverLetter && (
         <Card className="shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-2xl">Your Cover Letter</CardTitle>
              <CardDescription>A compelling cover letter generated just for you.</CardDescription>
            </div>
            <Button onClick={handleCopyCoverLetter} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy Text
            </Button>
          </CardHeader>
          <CardContent>
            <div className="p-6 md:p-8 bg-white rounded-xl shadow-inner border text-gray-800">
              <div className="cover-letter-output prose max-w-none" dangerouslySetInnerHTML={{ __html: coverLetter.replace(/\n/g, '<br />') }} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center py-4">
        <Button variant="outline" onClick={prevStep}>Back</Button>
      </div>
    </div>
  );
}
