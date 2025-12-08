"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  UploadCloud, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2, 
  Loader2,
  ArrowRight,
  Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function UploadPage() {
  const t = useTranslations('upload');
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock Resume Data
  const [resumeData, setResumeData] = useState({
    fullName: "Alex Johnson",
    email: "alex.johnson@example.com",
    experience: [
      { id: 1, role: "Senior Developer", company: "Tech Corp", duration: "2020 - Present" },
      { id: 2, role: "Web Developer", company: "Startup Inc", duration: "2018 - 2020" }
    ],
    skills: "React, Next.js, TypeScript, Tailwind CSS, Node.js"
  });

  const handleFileUpload = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      setCurrentStep(2);
    }, 2000);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep(4);
    }, 2500);
  };

  const steps = [
    { id: 1, title: 'Upload CV', icon: UploadCloud },
    { id: 2, title: 'Review Data', icon: FileText },
    { id: 3, title: 'Generate', icon: CheckCircle2 },
    { id: 4, title: 'Result', icon: FileText },
  ];

  return (
    <div className='max-w-5xl mx-auto space-y-6'>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Build Your ATS-Friendly CV</h1>
        <p className="text-muted-foreground mt-2">
          Upload your current CV, review the extracted data, and let AI tailor it to your dream job.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${currentStep >= step.id 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : 'border-muted-foreground/30 text-muted-foreground'}`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`ml-3 font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <Card className="max-w-2xl mx-auto border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
             <div className="p-4 bg-primary/10 rounded-full">
                <UploadCloud className="w-12 h-12 text-primary" />
             </div>
             <div className="space-y-2">
               <h3 className="text-xl font-semibold">Upload your CV (PDF or DOCX)</h3>
               <p className="text-sm text-muted-foreground max-w-sm">
                 Drag and drop your file here, or click to browse. We'll extract your details automatically.
               </p>
             </div>
             <Button size="lg" onClick={handleFileUpload} disabled={isUploading} className="mt-4">
               {isUploading ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Analyzing...
                 </>
               ) : (
                 'Select File'
               )}
             </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review Extracted Data */}
      {currentStep === 2 && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Personal Info & Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Full Name</Label>
                   <Input defaultValue={resumeData.fullName} />
                </div>
                <div className="space-y-2">
                   <Label>Email</Label>
                   <Input defaultValue={resumeData.email} />
                </div>
              </div>
              <div className="space-y-2">
                 <Label>Skills</Label>
                 <Textarea defaultValue={resumeData.skills} rows={3} />
              </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Work Experience</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">+ Add</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="border rounded-md p-4 space-y-2 relative">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6">
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <div className="font-semibold">{exp.role}</div>
                  <div className="text-sm text-muted-foreground">{exp.company} • {exp.duration}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
             <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
             <Button onClick={() => setCurrentStep(3)}>
               Continue to Job Description <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
          </div>
        </div>
      )}

      {/* Step 3: Job Description */}
      {currentStep === 3 && (
        <div className="max-w-3xl mx-auto space-y-6">
           <Card>
             <CardHeader>
               <CardTitle>Target Job Description</CardTitle>
               <CardDescription>
                 Paste the job description you are applying for. Our AI will optimize your CV to match these requirements.
               </CardDescription>
             </CardHeader>
             <CardContent>
               <Textarea 
                 placeholder="Paste job description here..." 
                 className="min-h-[200px]"
               />
             </CardContent>
           </Card>

           <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg border border-yellow-200 dark:border-yellow-900 flex gap-3">
             <div className="shrink-0 mt-0.5">💡</div>
             <div className="text-sm">
               <span className="font-semibold">AI Tip:</span> Adding the job title and company name helps us tailor the profile summary even better.
             </div>
           </div>

           <div className="flex justify-end gap-3">
             <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
             <Button  onClick={handleGenerate} disabled={isGenerating}>
               {isGenerating ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Generating Optimized CV...
                 </>
               ) : (
                 'Generate My CV'
               )}
             </Button>
           </div>
        </div>
      )}

      {/* Step 4: Result View */}
      {currentStep === 4 && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
           {/* Left Control Panel */}
           <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    CV Generated!
                  </CardTitle>
                  <CardDescription>
                    Your AI-optimized CV is ready. Review the result or regenerate if needed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 gap-3">
                      <Button className="w-full" variant="default">
                        <FileText className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                      <Button className="w-full" variant="outline">
                        <FileText className="mr-2 h-4 w-4" /> Download DOCX
                      </Button>
                   </div>
                   
                   <Separator />

                   <div className="space-y-2">
                      <h4 className="font-medium text-sm">Refine Result</h4>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentStep(2)}>
                         <Edit2 className="mr-2 h-4 w-4" /> Edit Sections
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentStep(3)}>
                         <Loader2 className="mr-2 h-4 w-4" /> Regenerate Variant
                      </Button>
                   </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                 <CardContent className="p-4 space-y-2">
                    <h4 className="font-semibold text-sm">AI Impact Score</h4>
                    <div className="flex items-end gap-2">
                       <span className="text-3xl font-bold text-primary">92%</span>
                       <span className="text-sm text-muted-foreground mb-1">Match Rate</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden border">
                       <div className="h-full bg-green-500 w-[92%]" />
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Right Preview Panel */}
           <div className="lg:col-span-2 bg-muted/30 rounded-lg border flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b bg-background/50 flex items-center justify-between">
                 <span className="text-sm font-medium">Preview</span>
                 <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400/20" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400/20" />
                    <div className="h-3 w-3 rounded-full bg-green-400/20" />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-zinc-900 shadow-inner flex justify-center">
                 {/* Mock PDF Viewer / Resume Page */}
                 <div className="w-full max-w-[800px] min-h-[1000px] bg-white text-black shadow-lg p-12 space-y-6 origin-top scale-95">
                    <header className="border-b pb-6 mb-6">
                       <h1 className="text-4xl font-bold uppercase tracking-tight text-gray-900">{resumeData.fullName}</h1>
                       <div className="text-sm text-gray-600 mt-2 flex gap-4">
                          <span>{resumeData.email}</span>
                          <span>•</span>
                          <span>+1 (555) 000-0000</span>
                          <span>•</span>
                          <span>New York, NY</span>
                       </div>
                    </header>

                    <section className="space-y-3">
                       <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b-2 border-gray-900 pb-1">Professional Summary</h2>
                       <p className="text-sm text-gray-700 leading-relaxed">
                          Results-oriented Senior Developer with 5+ years of experience building scalable web applications. 
                          Proven track record of optimizing performance and leading cross-functional teams. 
                          Expertise in full-stack development using modern technologies like React, Node.js, and Cloud Infrastructure.
                       </p>
                    </section>

                    <section className="space-y-4">
                       <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b-2 border-gray-900 pb-1">Experience</h2>
                       {resumeData.experience.map((exp) => (
                          <div key={exp.id}>
                             <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-gray-900">{exp.role}</h3>
                                <span className="text-sm text-gray-600 italic">{exp.duration}</span>
                             </div>
                             <div className="text-gray-800 font-medium">{exp.company}</div>
                             <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                                <li>Led development of core features resulting in 20% increase in user engagement.</li>
                                <li>Optimized database queries reducing load times by 40%.</li>
                                <li>Mentored junior developers and established code quality standards.</li>
                             </ul>
                          </div>
                       ))}
                    </section>

                     <section className="space-y-3">
                       <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b-2 border-gray-900 pb-1">Skills</h2>
                       <div className="flex flex-wrap gap-2">
                          {resumeData.skills.split(',').map((skill, i) => (
                             <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded">
                                {skill.trim()}
                             </span>
                          ))}
                       </div>
                    </section>
                    
                    <section className="space-y-3">
                       <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b-2 border-gray-900 pb-1">Education</h2>
                       <div>
                          <div className="flex justify-between items-baseline">
                             <h3 className="font-bold text-gray-900">B.S. Computer Science</h3>
                             <span className="text-sm text-gray-600 italic">2014 - 2018</span>
                          </div>
                          <div className="text-gray-800">University of Technology</div>
                       </div>
                    </section>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
