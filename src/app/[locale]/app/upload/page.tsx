"use client";

import { useState, useRef, useCallback, useMemo } from 'react';
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
  FileEdit,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  MapPin,
  RefreshCw,
  Settings,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import Link from 'next/link';
import { Zap, CreditCard } from 'lucide-react';
import { useUploadCv, useTailorCv } from '@/features/upload-cv/hooks';
import { 
  type ResumeData, 
  type ResumeSection,
  type SectionItem,
  type CvTailorResponse,
  emptyResumeData, 
  PII_FIELDS 
} from '@/features/upload-cv/types';
import { exportToPdf, exportToDocx } from '@/features/upload-cv/utils/exportCv';
import { useRouter } from 'next/navigation';
import { ResumeService } from '@/services/resume.service';
import { JobApplicationService } from '@/services/job-application.service';
import { Save, Bookmark } from 'lucide-react';

export default function UploadPage() {
  const t = useTranslations('upload');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvPreviewRef = useRef<HTMLDivElement>(null);
  
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
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [showTokenLimitModal, setShowTokenLimitModal] = useState(false);
  const [jobDescriptionError, setJobDescriptionError] = useState('');
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [isTrackingApplication, setIsTrackingApplication] = useState(false);
  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);
  const [trackedApplicationId, setTrackedApplicationId] = useState<number | null>(null);
  
  // API Hooks
  const { mutate: uploadCv, isPending: isUploading } = useUploadCv();
  const { mutate: tailorCv, isPending: isTailoring } = useTailorCv();

  // Handlers
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    
    // Auth check
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error(t('authRequired'));
      router.push('/login?redirect=/app/upload');
      return;
    }

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
      onError: (error: any) => {
        // Handle TOKEN_LIMIT_EXCEEDED error
        if (error?.errorCode === 'TOKEN_LIMIT_EXCEEDED' || error?.message === 'TOKEN_LIMIT_EXCEEDED') {
          setShowTokenLimitModal(true);
        }
      },
    });
  }, [uploadCv, router, t]);

  const handleManualEntry = useCallback(() => {
    setResumeData(emptyResumeData);
    setCurrentStep(2);
  }, []);

  // Download handlers
  const handleDownloadPdf = useCallback(async () => {
    if (!cvPreviewRef.current || !tailorResponse) return;
    
    setIsExportingPdf(true);
    try {
      const filename = `${tailorResponse.tailoredCv.personalInfo.fullName || 'cv'}_tailored`;
      await exportToPdf(cvPreviewRef.current, filename, tailorResponse.tailoredCv);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  }, [tailorResponse]);

  const handleDownloadDocx = useCallback(async () => {
    if (!tailorResponse) return;
    
    setIsExportingDocx(true);
    try {
      const filename = `${tailorResponse.tailoredCv.personalInfo.fullName || 'cv'}_tailored`;
      await exportToDocx(tailorResponse.tailoredCv, filename);
      toast.success('DOCX downloaded successfully!');
    } catch (error) {
      console.error('DOCX export failed:', error);
      toast.error('Failed to download DOCX. Please try again.');
    } finally {
      setIsExportingDocx(false);
    }
  }, [tailorResponse]);

  // Save tailored CV to My Resumes
  const handleSaveToResumes = useCallback(async () => {
    if (!tailorResponse?.tailoredCv) return;
    
    setIsSavingResume(true);
    try {
      const title = `${tailorResponse.tailoredCv.personalInfo.fullName || 'My CV'} - ${jobTitle || 'Tailored'}`;
      const saved = await ResumeService.create(title, tailorResponse.tailoredCv);
      setSavedResumeId(saved.id);
      toast.success('CV saved to My Resumes!');
    } catch (error) {
      console.error('Save to resumes failed:', error);
      toast.error('Failed to save CV. Please try again.');
    } finally {
      setIsSavingResume(false);
    }
  }, [tailorResponse, jobTitle]);

  // Track as Job Application
  const handleTrackApplication = useCallback(async () => {
    if (!tailorResponse) return;
    
    setIsTrackingApplication(true);
    try {
      const application = await JobApplicationService.create({
        jobTitle: jobTitle || 'Unknown Position',
        company: companyName || 'Unknown Company',
        jobDescription: jobDescription,
        tailoredCV: JSON.stringify(tailorResponse.tailoredCv),
        coverLetter: tailorResponse.coverLetter || undefined,
        applicationStatus: 'draft',
      });
      setTrackedApplicationId(application.id);
      toast.success('Added to Job Tracker!');
    } catch (error) {
      console.error('Track application failed:', error);
      toast.error('Failed to track application. Please try again.');
    } finally {
      setIsTrackingApplication(false);
    }
  }, [tailorResponse, jobTitle, companyName, jobDescription]);

  const handleGenerate = useCallback(() => {
    if (!resumeData) return;
    
    // Validate job description
    const trimmedDesc = jobDescription.trim();
    if (!trimmedDesc) {
      setJobDescriptionError('Job description is required');
      return;
    }
    if (trimmedDesc.length < 50) {
      setJobDescriptionError('Job description must be at least 50 characters for accurate tailoring');
      return;
    }
    setJobDescriptionError('');
    
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
  const updateSectionItem = useCallback((sectionId: string, itemId: string, field: string, value: string | string[]) => {
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

  // Add new section
  const addSection = useCallback((type: ResumeSection['type'], title: string) => {
    setResumeData(prev => {
      if (!prev) return null;
      const newSection: ResumeSection = {
        id: `section-${Date.now()}`,
        title,
        type,
        items: [],
        order: prev.sections.length,
        isVisible: true,
      };
      return {
        ...prev,
        sections: [...prev.sections, newSection]
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

  // Get section type for rendering
  const getSectionType = (section: ResumeSection): 'skills' | 'languages' | 'default' => {
    const type = section.type.toLowerCase();
    if (type === 'skills') return 'skills';
    if (type === 'languages') return 'languages';
    return 'default';
  };

  // Check if there are additional features to show in tabs
  const hasAdditionalFeatures = useMemo(() => {
    if (!tailorResponse) return false;
    return !!(
      tailorResponse.coverLetter ||
      tailorResponse.interviewPrep?.questions?.length ||
      tailorResponse.roadmap?.steps?.length
    );
  }, [tailorResponse]);

  const steps = [
    { id: 1, title: 'Upload CV', icon: UploadCloud },
    { id: 2, title: 'Review Data', icon: FileText },
    { id: 3, title: 'Generate', icon: Sparkles },
    { id: 4, title: 'Result', icon: CheckCircle2 },
  ];

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className='max-w-7xl mx-auto space-y-6 pb-12'>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Build Your ATS-Friendly CV</h1>
        <p className="text-muted-foreground mt-2">
          Upload your current CV, review the extracted data, and let AI tailor it to your dream job.
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
          {resumeData.sections.map((section) => {
            const sectionType = getSectionType(section);
            
            // Skills Section: Consolidated single-block editing
            if (sectionType === 'skills') {
              // Get all skills as titles from items
              const allSkills = section.items.map(item => item.title).filter(Boolean);
              
              return (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle className="capitalize">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Skills (comma-separated)</Label>
                      <Textarea 
                        value={allSkills.join(', ')} 
                        onChange={(e) => {
                          // Parse comma-separated input into individual items
                          const newSkills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setResumeData(prev => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              sections: prev.sections.map(s => 
                                s.id === section.id 
                                  ? { 
                                      ...s, 
                                      items: newSkills.map((skill, idx) => ({
                                        id: `skill-${idx}`,
                                        title: skill,
                                        subtitle: '',
                                        date: '',
                                        description: '',
                                        location: '',
                                        tags: [],
                                        isVisible: true,
                                      }))
                                    }
                                  : s
                              )
                            };
                          });
                        }}
                        placeholder="Java, Spring Boot, Angular, TypeScript, React..."
                        rows={3}
                      />
                    </div>
                    {/* Visual Tags */}
                    {allSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {allSkills.slice(0, 15).map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md border border-blue-200"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => {
                                const newSkills = allSkills.filter((_, i) => i !== idx);
                                setResumeData(prev => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    sections: prev.sections.map(s => 
                                      s.id === section.id 
                                        ? { 
                                            ...s, 
                                            items: newSkills.map((sk, i) => ({
                                              id: `skill-${i}`,
                                              title: sk,
                                              subtitle: '',
                                              date: '',
                                              description: '',
                                              location: '',
                                              tags: [],
                                              isVisible: true,
                                            }))
                                          }
                                        : s
                                    )
                                  };
                                });
                              }}
                              className="ml-0.5 hover:text-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        {allSkills.length > 15 && (
                          <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                            +{allSkills.length - 15} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }
            
            // Other sections: Normal item-by-item rendering
            return (
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
                  {section.items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3 relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-6 w-6 text-destructive"
                        onClick={() => removeSectionItem(section.id, item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      
                      {sectionType === 'languages' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input 
                            value={item.title} 
                            onChange={(e) => updateSectionItem(section.id, item.id, 'title', e.target.value)}
                            placeholder="Language (e.g., English)"
                          />
                          <Input 
                            value={item.subtitle || ''} 
                            onChange={(e) => updateSectionItem(section.id, item.id, 'subtitle', e.target.value)}
                            placeholder="Level (e.g., Native, Fluent)"
                          />
                        </div>
                      ) : section.type.toLowerCase() === 'certifications' || section.title.toLowerCase().includes('course') ? (
                        /* Courses/Certifications: Name + optional provider */
                        <Input 
                          value={item.title} 
                          onChange={(e) => updateSectionItem(section.id, item.id, 'title', e.target.value)}
                          placeholder="Course/Certification Name"
                        />
                      ) : section.title.toLowerCase().includes('interest') ? (
                        /* Interests: Name only */
                        <Input 
                          value={item.title} 
                          onChange={(e) => updateSectionItem(section.id, item.id, 'title', e.target.value)}
                          placeholder="Interest (e.g., Chess, Photography)"
                        />
                      ) : section.title.toLowerCase().includes('activit') || section.title.toLowerCase().includes('volunteer') ? (
                        /* Activities/Volunteering: Title + Role + Date */
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input 
                              value={item.title} 
                              onChange={(e) => updateSectionItem(section.id, item.id, 'title', e.target.value)}
                              placeholder="Organization/Event Name"
                            />
                            <Input 
                              value={item.subtitle || ''} 
                              onChange={(e) => updateSectionItem(section.id, item.id, 'subtitle', e.target.value)}
                              placeholder="Role (e.g., Volunteer, Organizer)"
                            />
                          </div>
                          <Input 
                            value={item.date || ''} 
                            onChange={(e) => updateSectionItem(section.id, item.id, 'date', e.target.value)}
                            placeholder="Date (e.g., 01/2024 or 2023 - 2024)"
                          />
                        </div>
                      ) : section.type.toLowerCase() === 'projects' ? (
                        /* Projects: Name + Tech Stack + Date + Description (no location) */
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input 
                              value={item.title} 
                              onChange={(e) => updateSectionItem(section.id, item.id, 'title', e.target.value)}
                              placeholder="Project Name"
                            />
                            <Input 
                              value={item.subtitle || ''} 
                              onChange={(e) => updateSectionItem(section.id, item.id, 'subtitle', e.target.value)}
                              placeholder="Tech Stack / Category"
                            />
                          </div>
                          <Input 
                            value={item.date || ''} 
                            onChange={(e) => updateSectionItem(section.id, item.id, 'date', e.target.value)}
                            placeholder="2024 or 01/2024 - Present"
                          />
                          <Textarea 
                            value={item.description || ''} 
                            onChange={(e) => updateSectionItem(section.id, item.id, 'description', e.target.value)}
                            placeholder="Brief description of the project..."
                            rows={2}
                          />
                        </>
                      ) : (
                        /* Default: Experience, Education - Full fields */
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input 
                              value={item.title} 
                              onChange={(e) => updateSectionItem(section.id, item.id, 'title', e.target.value)}
                              placeholder={section.type === 'experience' ? 'Job Title' : 'Title'}
                            />
                            <Input 
                              value={item.subtitle || ''} 
                              onChange={(e) => updateSectionItem(section.id, item.id, 'subtitle', e.target.value)}
                              placeholder={section.type === 'experience' ? 'Company' : section.type === 'education' ? 'Institution' : 'Subtitle'}
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
            );
          })}

          {/* Add New Section Dropdown + Navigation */}
          <div className="flex justify-between items-center gap-3">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Section
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {[
                    { type: 'experience', title: 'Experience', match: ['experience', 'professional experience'] },
                    { type: 'education', title: 'Education', match: ['education'] },
                    { type: 'projects', title: 'Projects', match: ['project'] },
                    { type: 'skills', title: 'Skills', match: ['skill', 'competenc'] },
                    { type: 'languages', title: 'Languages', match: ['language'] },
                    { type: 'certifications', title: 'Courses', match: ['course', 'certif'] },
                    { type: 'custom', title: 'Interests', match: ['interest', 'hobby'] },
                    { type: 'custom', title: 'Activities & Volunteering', match: ['activit', 'volunteer'] },
                  ].filter(s => !resumeData.sections.some(
                    existing => s.match.some(m => existing.title.toLowerCase().includes(m))
                  )).map(s => (
                    <DropdownMenuItem
                      key={s.title}
                      onClick={() => addSection(s.type as ResumeSection['type'], s.title.toUpperCase())}
                      className="cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2 text-muted-foreground" />
                      {s.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                onClick={() => setCurrentStep(3)} 
                disabled={!isResumeValid()}
              >
                Continue to Generate <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
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
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    if (jobDescriptionError) setJobDescriptionError('');
                  }}
                  placeholder="Paste the full job description here..."
                  className={`min-h-[200px] ${jobDescriptionError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {jobDescriptionError && (
                  <p className="text-sm text-red-500">{jobDescriptionError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {jobDescription.length}/50 characters minimum
                </p>
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
            <Button onClick={handleGenerate} disabled={isTailoring || jobDescription.trim().length < 50}>
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

      {/* Step 4: Result - Original Layout */}
      {currentStep === 4 && tailorResponse && (
        <div className="space-y-6">
          {/* Main Layout: Sidebar + Preview + Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Status Card */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">CV Generated!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your AI-optimized CV is ready. Review the result or regenerate if needed.
                  </p>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={handleDownloadPdf}
                      disabled={isExportingPdf || isExportingDocx}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isExportingPdf ? 'Exporting PDF...' : 'Download PDF'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={handleDownloadDocx}
                      disabled={isExportingPdf || isExportingDocx}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isExportingDocx ? 'Exporting DOCX...' : 'Download DOCX'}
                    </Button>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={handleSaveToResumes}
                      disabled={isSavingResume || !!savedResumeId}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {savedResumeId ? 'Saved to Resumes' : isSavingResume ? 'Saving...' : 'Save to My Resumes'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={handleTrackApplication}
                      disabled={isTrackingApplication || !!trackedApplicationId}
                    >
                      <Bookmark className="mr-2 h-4 w-4" />
                      {trackedApplicationId ? 'Added to Tracker' : isTrackingApplication ? 'Adding...' : 'Track Application'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Refine Options */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Refine Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" /> Edit Sections
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Regenerate Variant
                  </Button>
                </CardContent>
              </Card>

              {/* ATS Score */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">ATS Match Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Before/After Comparison */}
                  {tailorResponse.originalAtsScore && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Before</p>
                        <span className={`text-xl font-bold ${getScoreColor(tailorResponse.originalAtsScore.overall)}`}>
                          {tailorResponse.originalAtsScore.overall}%
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        {tailorResponse.atsScore.overall > tailorResponse.originalAtsScore.overall && (
                          <span className="text-xs text-green-600 font-semibold">
                            +{tailorResponse.atsScore.overall - tailorResponse.originalAtsScore.overall}%
                          </span>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">After</p>
                        <span className={`text-xl font-bold ${getScoreColor(tailorResponse.atsScore.overall)}`}>
                          {tailorResponse.atsScore.overall}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Main Score Display */}
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-bold ${getScoreColor(tailorResponse.atsScore.overall)}`}>
                        {tailorResponse.atsScore.overall}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {tailorResponse.originalAtsScore ? 'Optimized Score' : 'Match Rate'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${getScoreBarColor(tailorResponse.atsScore.overall)}`}
                        style={{ width: `${tailorResponse.atsScore.overall}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Keywords</p>
                        <p className="font-semibold">{tailorResponse.atsScore.keywordMatch}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Skills</p>
                        <p className="font-semibold">{tailorResponse.atsScore.skillsMatch}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  {tailorResponse.atsScore.missingKeywords && tailorResponse.atsScore.missingKeywords.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Missing Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tailorResponse.atsScore.missingKeywords.slice(0, 10).map((keyword, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Preview */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Preview</CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch checked={maskPII} onCheckedChange={setMaskPII} id="mask-pii" />
                    <Label htmlFor="mask-pii" className="text-sm flex items-center gap-1">
                      {maskPII ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      Mask Personal Info
                    </Label>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* CV Preview Document */}
                  <div 
                    ref={cvPreviewRef}
                    className="bg-white rounded-[1px] border shadow-sm mx-auto w-full max-w-[850px] min-h-[1100px] p-[40px] text-gray-900 font-sans leading-relaxed selection:bg-blue-100"
                  >
                    <div className="space-y-6">
                      {/* Header */}
                      <header className="border-b-2 border-gray-800 pb-5">
                        <h1 className="text-4xl font-bold uppercase tracking-tight text-gray-900 mb-3">
                          {getDisplayValue('personalInfo.fullName', tailorResponse.tailoredCv.personalInfo.fullName)}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-y-2 text-sm text-gray-700 font-medium">
                          {tailorResponse.tailoredCv.personalInfo.email && (
                            <span className="flex items-center hover:text-primary transition-colors">
                              <Mail className="w-3.5 h-3.5 mr-1.5" />
                              {getDisplayValue('personalInfo.email', tailorResponse.tailoredCv.personalInfo.email)}
                            </span>
                          )}
                          {tailorResponse.tailoredCv.personalInfo.phone && (
                            <>
                              <span className="mx-3 text-gray-300">|</span>
                              <span className="flex items-center hover:text-primary transition-colors">
                                <Phone className="w-3.5 h-3.5 mr-1.5" />
                                {getDisplayValue('personalInfo.phone', tailorResponse.tailoredCv.personalInfo.phone)}
                              </span>
                            </>
                          )}
                          {(tailorResponse.tailoredCv.personalInfo.city || tailorResponse.tailoredCv.personalInfo.country) && (
                            <>
                              <span className="mx-3 text-gray-300">|</span>
                              <span className="flex items-center hover:text-primary transition-colors">
                                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                {[tailorResponse.tailoredCv.personalInfo.city, tailorResponse.tailoredCv.personalInfo.country].filter(Boolean).join(', ')}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Social Links */}
                        {(tailorResponse.tailoredCv.personalInfo.linkedin || 
                          tailorResponse.tailoredCv.personalInfo.github || 
                          tailorResponse.tailoredCv.personalInfo.website) && (
                          <div className="flex flex-wrap items-center gap-y-2 mt-2 text-sm text-gray-700 font-medium">
                            {tailorResponse.tailoredCv.personalInfo.linkedin && (
                              maskPII ? (
                                <span className="mr-4 text-gray-400">••••••••••••</span>
                              ) : (
                                <a 
                                  href={tailorResponse.tailoredCv.personalInfo.linkedin.startsWith('http') ? tailorResponse.tailoredCv.personalInfo.linkedin : tailorResponse.tailoredCv.personalInfo.linkedin.includes('linkedin.com') ? `https://${tailorResponse.tailoredCv.personalInfo.linkedin}` : `https://linkedin.com/in/${tailorResponse.tailoredCv.personalInfo.linkedin}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center mr-4 text-blue-700 hover:text-blue-900 transition-colors hover:underline"
                                >
                                  <Linkedin className="w-3.5 h-3.5 mr-1.5" />
                                  {tailorResponse.tailoredCv.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '')}
                                </a>
                              )
                            )}
                            {tailorResponse.tailoredCv.personalInfo.github && (
                              maskPII ? (
                                <span className="mr-4 text-gray-400">••••••••••••</span>
                              ) : (
                                <a 
                                  href={tailorResponse.tailoredCv.personalInfo.github.startsWith('http') ? tailorResponse.tailoredCv.personalInfo.github : tailorResponse.tailoredCv.personalInfo.github.includes('github.com') ? `https://${tailorResponse.tailoredCv.personalInfo.github}` : `https://github.com/${tailorResponse.tailoredCv.personalInfo.github}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center mr-4 text-gray-800 hover:text-black transition-colors hover:underline"
                                >
                                  <Github className="w-3.5 h-3.5 mr-1.5" />
                                  {tailorResponse.tailoredCv.personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '')}
                                </a>
                              )
                            )}
                            {tailorResponse.tailoredCv.personalInfo.website && (
                              maskPII ? (
                                <span className="mr-4 text-gray-400">••••••••••••</span>
                              ) : (
                                <a 
                                  href={tailorResponse.tailoredCv.personalInfo.website.startsWith('http') ? tailorResponse.tailoredCv.personalInfo.website : `https://${tailorResponse.tailoredCv.personalInfo.website}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center mr-4 text-emerald-700 hover:text-emerald-900 transition-colors hover:underline"
                                >
                                  <Globe className="w-3.5 h-3.5 mr-1.5" />
                                  {tailorResponse.tailoredCv.personalInfo.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                                </a>
                              )
                            )}
                          </div>
                        )}
                      </header>

                      {/* Summary */}
                      {tailorResponse.tailoredCv.personalInfo.summary && (
                        <section>
                          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                            <span className="w-1 h-3.5 bg-gray-900 rounded-sm inline-block"></span>
                            Professional Summary
                          </h2>
                          <div className="text-[0.925rem] text-gray-800 leading-relaxed text-justify">
                            {tailorResponse.tailoredCv.personalInfo.summary}
                          </div>
                        </section>
                      )}

                      {/* Dynamic Sections */}
                      {tailorResponse.tailoredCv.sections.map((section) => {
                        if (!section.items?.length) return null;
                        const sectionType = section.type.toLowerCase();
                        
                        return (
                          <section key={section.id} className="mt-6">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                              <span className="w-1 h-3.5 bg-gray-900 rounded-sm inline-block"></span>
                              {section.title}
                            </h2>
                            
                            {sectionType === 'skills' ? (
                              <div className="flex flex-wrap gap-2">
                                {section.items.flatMap((item) => 
                                  item.tags && item.tags.length > 0 
                                    ? item.tags.map((tag, idx) => (
                                        <span 
                                          key={`${item.id}-${idx}`} 
                                          className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-800 text-sm font-medium rounded-[4px] hover:bg-gray-200 transition-colors"
                                        >
                                          {tag}
                                        </span>
                                      ))
                                    : item.title ? [(
                                        <span 
                                          key={item.id} 
                                          className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-800 text-sm font-medium rounded-[4px]"
                                        >
                                          {item.title}
                                        </span>
                                      )] : []
                                )}
                              </div>
                            ) : sectionType === 'languages' ? (
                              <div className="grid grid-cols-2 gap-4">
                                {section.items.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100">
                                    <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                                    {item.subtitle && <span className="text-gray-600 text-xs uppercase tracking-wide bg-white px-2 py-0.5 rounded shadow-sm border">{item.subtitle}</span>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {section.items.map((item) => (
                                  <div key={item.id} className="group">
                                    <div className="flex justify-between items-baseline mb-1">
                                      <h3 className="font-bold text-gray-900 text-[1.05rem]">
                                        {item.title}
                                        {item.subtitle && <span className="font-normal text-gray-700 mx-2">|</span>}
                                        {item.subtitle && <span className="text-gray-700 font-semibold">{item.subtitle}</span>}
                                      </h3>
                                      <div className="text-right shrink-0 ml-4">
                                        <span className="font-medium text-gray-600 text-sm block">{item.date}</span>
                                        {item.location && <span className="text-gray-500 text-xs block mt-0.5">{item.location}</span>}
                                      </div>
                                    </div>
                                    
                                    {item.description && (
                                      <div className="text-[0.925rem] text-gray-800 leading-relaxed mt-1.5 text-justify group-hover:text-gray-950 transition-colors">
                                        {item.description.includes('•') || item.description.includes('- ') ? (
                                           <ul className="list-disc leading-relaxed pl-5 space-y-1">
                                             {item.description.split(/(?=[•-])/).map((line, idx) => {
                                               const cleanLine = line.replace(/^[•-]\s*/, '').trim();
                                               if (!cleanLine) return null;
                                               return <li key={idx} className="pl-1">{cleanLine}</li>;
                                             })}
                                           </ul>
                                        ) : (
                                          item.description
                                        )}
                                      </div>
                                    )}
                                    
                                    {item.tags && item.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-x-1.5 gap-y-1 mt-2.5">
                                        {item.tags.map((tag, idx) => (
                                          <span 
                                            key={idx} 
                                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </section>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Features Tabs - Below the main content */}
          {hasAdditionalFeatures && (
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue={tailorResponse.coverLetter ? 'cover-letter' : tailorResponse.interviewPrep ? 'interview' : 'roadmap'}>
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                    {tailorResponse.coverLetter && (
                      <TabsTrigger 
                        value="cover-letter" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Cover Letter
                      </TabsTrigger>
                    )}
                    {tailorResponse.interviewPrep?.questions?.length && (
                      <TabsTrigger 
                        value="interview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Interview Prep
                      </TabsTrigger>
                    )}
                    {tailorResponse.roadmap?.steps?.length && (
                      <TabsTrigger 
                        value="roadmap"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <Map className="h-4 w-4 mr-2" />
                        Career Roadmap
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {/* Cover Letter Tab */}
                  {tailorResponse.coverLetter && (
                    <TabsContent value="cover-letter" className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">Generated Cover Letter</h3>
                          <p className="text-sm text-muted-foreground">Tailored to the job description</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            navigator.clipboard.writeText(tailorResponse.coverLetter || '');
                            toast.success('Copied to clipboard!');
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                          {tailorResponse.coverLetter}
                        </pre>
                      </div>
                    </TabsContent>
                  )}

                  {/* Interview Tab */}
                  {tailorResponse.interviewPrep?.questions?.length && (
                    <TabsContent value="interview" className="p-6">
                      <div className="mb-4">
                        <h3 className="font-semibold">Potential Interview Questions</h3>
                        <p className="text-sm text-muted-foreground">Based on the job requirements and your experience</p>
                      </div>
                      <div className="space-y-3">
                        {tailorResponse.interviewPrep.questions.map((q, i) => (
                          <div key={i} className="p-4 bg-muted rounded-lg">
                            <div className="flex items-start justify-between gap-4">
                              <p className="font-medium">
                                <span className="text-primary mr-2">Q{i + 1}:</span>
                                {q.question}
                              </p>
                              {q.category && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded capitalize whitespace-nowrap">
                                  {q.category}
                                </span>
                              )}
                            </div>
                            {q.hint && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <strong>Hint:</strong> {q.hint}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}

                  {/* Roadmap Tab */}
                  {tailorResponse.roadmap?.steps?.length && (
                    <TabsContent value="roadmap" className="p-6">
                      <div className="mb-4">
                        <h3 className="font-semibold">Career Development Roadmap</h3>
                        <p className="text-sm text-muted-foreground">Skills and steps to improve your fit for this role</p>
                      </div>
                      
                      {tailorResponse.roadmap.skillGaps && tailorResponse.roadmap.skillGaps.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium mb-2">Skills to Develop</h4>
                          <div className="flex flex-wrap gap-2">
                            {tailorResponse.roadmap.skillGaps.map((skill, i) => (
                              <span 
                                key={i} 
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {tailorResponse.roadmap.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{step.step}</p>
                              {step.timeframe && (
                                <p className="text-sm text-muted-foreground mt-0.5">⏱️ {step.timeframe}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </div>
      )}

      {/* Token Limit Exceeded Modal */}
      <AlertDialog open={showTokenLimitModal} onOpenChange={setShowTokenLimitModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <Zap className="h-6 w-6 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-center">Token Limit Reached</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You've used all your monthly tokens. Upgrade your plan for more usage or purchase additional tokens to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-3 py-4">
            <Link href="/plans" className="w-full">
              <Button className="w-full" size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            </Link>
            <Link href="/app/tokens" className="w-full">
              <Button variant="outline" className="w-full" size="lg">
                <CreditCard className="mr-2 h-4 w-4" />
                Buy Token Package
              </Button>
            </Link>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="w-full">Maybe Later</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
