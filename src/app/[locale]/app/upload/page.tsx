"use client";

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Loader2,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Plus,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Sparkles,
  MessageSquare,
  Map,
  FileEdit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useUploadCv, useTailorCv } from '@/features/upload-cv/hooks';
import { 
  type ResumeData, 
  type ResumeSection,
  type SectionItem,
  type CvTailorResponse,
  emptyResumeData, 
  PII_FIELDS 
} from '@/features/upload-cv/types';

export default function UploadPage() {
  const t = useTranslations('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [tailorResponse, setTailorResponse] = useState<CvTailorResponse | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [generateCoverLetter, setGenerateCoverLetter] = useState(false);
  const [includeInterviewQuestions, setIncludeInterviewQuestions] = useState(false);
  const [includeRoadmap, setIncludeRoadmap] = useState(false);
  const [maskPII, setMaskPII] = useState(false);
  
  // API Hooks
  const { mutate: uploadCv, isPending: isUploading } = useUploadCv();
  const { mutate: tailorCv, isPending: isTailoring } = useTailorCv();

  // Handlers
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }
    
    uploadCv(file, {
      onSuccess: (data) => {
        if (data.resumeData) {
          setResumeData(data.resumeData);
          setCurrentStep(2);
          toast.success('CV parsed successfully!');
        } else {
          toast.error('Failed to parse CV data');
        }
      },
    });
  }, [uploadCv]);

  const handleManualEntry = useCallback(() => {
    setResumeData(emptyResumeData);
    setCurrentStep(2);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!resumeData) return;
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }
    
    tailorCv({
      resumeData,
      jobDescription,
      jobTitle: jobTitle || undefined,
      companyName: companyName || undefined,
      generateCoverLetter,
      includeInterviewQuestions,
      includeRoadmap,
    }, {
      onSuccess: (data) => {
        setTailorResponse(data);
        setCurrentStep(4);
        toast.success('CV tailored successfully!');
      },
    });
  }, [resumeData, jobDescription, jobTitle, companyName, generateCoverLetter, includeInterviewQuestions, includeRoadmap, tailorCv]);

  // Update personal info
  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setResumeData(prev => prev ? {
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    } : null);
  }, []);

  // Add section item
  const addSectionItem = useCallback((sectionId: string) => {
    setResumeData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map(section => 
          section.id === sectionId 
            ? { 
                ...section, 
                items: [...section.items, {
                  id: `item-${Date.now()}`,
                  title: '',
                  subtitle: '',
                  date: '',
                  description: '',
                  tags: [],
                }]
              }
            : section
        )
      };
    });
  }, []);

  // Update section item
  const updateSectionItem = useCallback((sectionId: string, itemId: string, field: string, value: string) => {
    setResumeData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map(section => 
          section.id === sectionId 
            ? { 
                ...section, 
                items: section.items.map(item =>
                  item.id === itemId ? { ...item, [field]: value } : item
                )
              }
            : section
        )
      };
    });
  }, []);

  // Remove section item
  const removeSectionItem = useCallback((sectionId: string, itemId: string) => {
    setResumeData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map(section => 
          section.id === sectionId 
            ? { ...section, items: section.items.filter(item => item.id !== itemId) }
            : section
        )
      };
    });
  }, []);

  // Mask value for display
  const maskValue = useCallback((value: string | undefined) => {
    if (!maskPII || !value) return value || '';
    return '•'.repeat(Math.min(value.length, 20));
  }, [maskPII]);

  // Get display value
  const getDisplayValue = useCallback((fieldPath: string, value: string | undefined) => {
    if (maskPII && PII_FIELDS.includes(fieldPath as any)) {
      return maskValue(value);
    }
    return value || '';
  }, [maskPII, maskValue]);

  // Check if required fields are filled
  const isResumeValid = useCallback(() => {
    if (!resumeData) return false;
    const { personalInfo } = resumeData;
    return !!(personalInfo.fullName && personalInfo.email);
  }, [resumeData]);

  const steps = [
    { id: 1, title: 'Upload CV', icon: UploadCloud },
    { id: 2, title: 'Review Data', icon: FileText },
    { id: 3, title: 'Job Details', icon: Sparkles },
    { id: 4, title: 'Result', icon: CheckCircle2 },
  ];

  return (
    <div className='max-w-5xl mx-auto space-y-6 pb-12'>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Build Your ATS-Friendly CV</h1>
        <p className="text-muted-foreground mt-2">
          Upload your current CV or start from scratch, and let AI tailor it to your dream job.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 sm:gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors
                ${currentStep >= step.id 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : 'border-muted-foreground/30 text-muted-foreground'}`}
              >
                <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`ml-2 text-sm font-medium hidden sm:inline ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <UploadCloud className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Upload your CV</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Drag and drop a PDF or DOCX file, or click to browse. We'll extract your details automatically.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                size="lg" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
              >
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={handleManualEntry}
          >
            <FileEdit className="mr-2 h-4 w-4" />
            Add Details Manually
          </Button>
        </div>
      )}

      {/* Step 2: Review/Edit Data */}
      {currentStep === 2 && resumeData && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your contact details (required fields marked with *)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input 
                    value={resumeData.personalInfo.fullName} 
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input 
                    type="email"
                    value={resumeData.personalInfo.email} 
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={resumeData.personalInfo.phone || ''} 
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input 
                    value={resumeData.personalInfo.jobTitle || ''} 
                    onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Professional Summary</Label>
                <Textarea 
                  value={resumeData.personalInfo.summary || ''} 
                  onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                  placeholder="Brief overview of your experience and skills..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input 
                    value={resumeData.personalInfo.linkedin || ''} 
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>GitHub</Label>
                  <Input 
                    value={resumeData.personalInfo.github || ''} 
                    onChange={(e) => updatePersonalInfo('github', e.target.value)}
                    placeholder="github.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input 
                    value={resumeData.personalInfo.website || ''} 
                    onChange={(e) => updatePersonalInfo('website', e.target.value)}
                    placeholder="yourwebsite.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Sections */}
          {resumeData.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="capitalize">{section.title}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => addSectionItem(section.id)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items yet. Click "Add" to add your {section.type}.
                  </p>
                )}
                {section.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3 relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6 text-destructive"
                      onClick={() => removeSectionItem(section.id, item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    
                    {section.type === 'skills' ? (
                      <div className="space-y-2">
                        <Input 
                          value={item.title} 
                          onChange={(e) => updateSectionItem(section.id, item.id, 'title', e.target.value)}
                          placeholder="Skill name (e.g., JavaScript, React)"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input 
                            value={item.title} 
                            onChange={(e) => updateSectionItem(section.id, item.id, 'title', e.target.value)}
                            placeholder={section.type === 'experience' ? 'Company Name' : 'Institution'}
                          />
                          <Input 
                            value={item.subtitle || ''} 
                            onChange={(e) => updateSectionItem(section.id, item.id, 'subtitle', e.target.value)}
                            placeholder={section.type === 'experience' ? 'Job Title' : 'Degree'}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input 
                            value={item.date || ''} 
                            onChange={(e) => updateSectionItem(section.id, item.id, 'date', e.target.value)}
                            placeholder="2020 - Present"
                          />
                          <Input 
                            value={item.location || ''} 
                            onChange={(e) => updateSectionItem(section.id, item.id, 'location', e.target.value)}
                            placeholder="City, Country"
                          />
                        </div>
                        <Textarea 
                          value={item.description || ''} 
                          onChange={(e) => updateSectionItem(section.id, item.id, 'description', e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={2}
                        />
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button 
              onClick={() => setCurrentStep(3)} 
              disabled={!isResumeValid()}
            >
              Continue to Job Details <ArrowRight className="ml-2 h-4 w-4" />
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
                Paste the job description you're applying for. Our AI will optimize your CV to match.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title (optional)</Label>
                  <Input 
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Name (optional)</Label>
                  <Input 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Tech Corp"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Job Description *</Label>
                <Textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Generate Cover Letter</Label>
                  <p className="text-sm text-muted-foreground">Create a tailored cover letter</p>
                </div>
                <Switch 
                  checked={generateCoverLetter} 
                  onCheckedChange={setGenerateCoverLetter} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Interview Questions</Label>
                  <p className="text-sm text-muted-foreground">Get potential interview questions</p>
                </div>
                <Switch 
                  checked={includeInterviewQuestions} 
                  onCheckedChange={setIncludeInterviewQuestions} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Career Roadmap</Label>
                  <p className="text-sm text-muted-foreground">Skills roadmap to improve your fit</p>
                </div>
                <Switch 
                  checked={includeRoadmap} 
                  onCheckedChange={setIncludeRoadmap} 
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleGenerate} disabled={isTailoring || !jobDescription.trim()}>
              {isTailoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Tailored CV
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {currentStep === 4 && tailorResponse && (
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="preview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="ats">ATS Score</TabsTrigger>
              {tailorResponse.interviewPrep && <TabsTrigger value="interview">Interview</TabsTrigger>}
              {tailorResponse.roadmap && <TabsTrigger value="roadmap">Roadmap</TabsTrigger>}
            </TabsList>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={maskPII} onCheckedChange={setMaskPII} />
                    <Label className="flex items-center gap-1">
                      {maskPII ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      Mask Personal Info
                    </Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </Button>
                </div>
              </div>

              {/* CV Preview */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg border shadow-lg p-8 sm:p-12 min-h-[600px]">
                <div className="max-w-[800px] mx-auto space-y-6 text-black dark:text-white">
                  <header className="border-b pb-4">
                    <h1 className="text-3xl font-bold">
                      {getDisplayValue('personalInfo.fullName', tailorResponse.tailoredCv.personalInfo.fullName)}
                    </h1>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex flex-wrap gap-3">
                      {tailorResponse.tailoredCv.personalInfo.email && (
                        <span>{getDisplayValue('personalInfo.email', tailorResponse.tailoredCv.personalInfo.email)}</span>
                      )}
                      {tailorResponse.tailoredCv.personalInfo.phone && (
                        <span>• {getDisplayValue('personalInfo.phone', tailorResponse.tailoredCv.personalInfo.phone)}</span>
                      )}
                    </div>
                  </header>

                  {tailorResponse.tailoredCv.personalInfo.summary && (
                    <section>
                      <h2 className="text-lg font-bold uppercase border-b-2 border-gray-900 dark:border-gray-100 pb-1 mb-2">
                        Professional Summary
                      </h2>
                      <p className="text-sm">{tailorResponse.tailoredCv.personalInfo.summary}</p>
                    </section>
                  )}

                  {tailorResponse.tailoredCv.sections.map((section) => (
                    section.items.length > 0 && (
                      <section key={section.id}>
                        <h2 className="text-lg font-bold uppercase border-b-2 border-gray-900 dark:border-gray-100 pb-1 mb-3">
                          {section.title}
                        </h2>
                        <div className="space-y-3">
                          {section.items.map((item) => (
                            <div key={item.id}>
                              {section.type === 'skills' ? (
                                <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-sm rounded mr-2 mb-2">
                                  {item.title}
                                </span>
                              ) : (
                                <div>
                                  <div className="flex justify-between">
                                    <h3 className="font-semibold">{item.subtitle || item.title}</h3>
                                    <span className="text-sm text-gray-500">{item.date}</span>
                                  </div>
                                  {item.subtitle && <div className="text-gray-600 dark:text-gray-400">{item.title}</div>}
                                  {item.description && <p className="text-sm mt-1">{item.description}</p>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    )
                  ))}
                </div>
              </div>

              {/* Cover Letter */}
              {tailorResponse.coverLetter && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Cover Letter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap font-sans text-sm">{tailorResponse.coverLetter}</pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ATS Score Tab */}
            <TabsContent value="ats" className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary">{tailorResponse.atsScore.overall}%</div>
                    <p className="text-muted-foreground mt-1">ATS Match Score</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <div className="text-2xl font-semibold">{tailorResponse.atsScore.keywordMatch}%</div>
                      <p className="text-sm text-muted-foreground">Keyword Match</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <div className="text-2xl font-semibold">{tailorResponse.atsScore.skillsMatch}%</div>
                      <p className="text-sm text-muted-foreground">Skills Match</p>
                    </div>
                  </div>

                  {tailorResponse.atsScore.missingKeywords && tailorResponse.atsScore.missingKeywords.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {tailorResponse.atsScore.missingKeywords.map((keyword, i) => (
                          <span key={i} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {tailorResponse.atsScore.suggestions && tailorResponse.atsScore.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Suggestions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {tailorResponse.atsScore.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interview Tab */}
            {tailorResponse.interviewPrep && (
              <TabsContent value="interview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Interview Preparation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tailorResponse.interviewPrep.questions.map((q, i) => (
                      <div key={i} className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-medium">Q{i + 1}: {q.question}</p>
                          {q.category && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded capitalize">
                              {q.category}
                            </span>
                          )}
                        </div>
                        {q.hint && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Hint:</strong> {q.hint}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Roadmap Tab */}
            {tailorResponse.roadmap && (
              <TabsContent value="roadmap" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="h-5 w-5" />
                      Career Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {tailorResponse.roadmap.skillGaps && tailorResponse.roadmap.skillGaps.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Skills to Develop</h4>
                        <div className="flex flex-wrap gap-2">
                          {tailorResponse.roadmap.skillGaps.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-3">Action Steps</h4>
                      <div className="space-y-3">
                        {tailorResponse.roadmap.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-medium">{step.step}</p>
                              {step.timeframe && (
                                <p className="text-sm text-muted-foreground mt-0.5">⏱️ {step.timeframe}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          <div className="flex justify-between gap-3 mt-6">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              <Edit2 className="mr-2 h-4 w-4" /> Edit Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
