// CV Upload and Tailoring Types

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  summary?: string;
  jobTitle?: string;
  picture?: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

// Level types for skills and languages
export type SkillLevel = 'expert' | 'advanced' | 'intermediate' | 'beginner' | 'none';

// Display style types
export type SkillsDisplayStyle = 'tags' | 'level' | 'dots' | 'bar';
export type LanguagesDisplayStyle = 'level' | 'dots' | 'bar';
export type CoursesDisplayStyle = 'detailed' | 'simple';

export interface SectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  startDate?: string;  // For separate date fields
  endDate?: string;    // For separate date fields
  description?: string;
  location?: string;
  tags?: string[];
  level?: SkillLevel;  // For skills and languages level
  visible?: boolean; // Backend uses 'visible'
  isVisible?: boolean; // Deprecated, use 'visible'
}

export interface ResumeSection {
  id: string;
  title: string;
  type: 'experience' | 'education' | 'skills' | 'languages' | 'certifications' | 'projects' | 'custom';
  items: SectionItem[];
  visible?: boolean; // Backend uses 'visible'
  isVisible?: boolean; // Deprecated, use 'visible'
  order?: number;
  style?: string;
}

export interface ResumeMetadata {
  templateId?: string;
  primaryColor?: string;
  fontFamily?: string;
  language?: string;
  // Display style options
  skillsDisplayStyle?: SkillsDisplayStyle;
  languagesDisplayStyle?: LanguagesDisplayStyle;
  coursesDisplayStyle?: CoursesDisplayStyle;
  layoutDirection?: 'ltr' | 'rtl' | 'auto';
  sectionOrder?: string[]; // Ordered array of section IDs
  compactMode?: boolean;
  spacingLevel?: number;
  margins?: { top?: number; bottom?: number; left?: number; right?: number; };
  headingFontFamily?: string;
  bodyFontFamily?: string;
  sectionColumns?: Record<string, number>;
}

export interface ResumeData {
  /** Client-only: resume record id after load/create (not always present on API payloads). */
  id?: string;
  personalInfo: PersonalInfo;
  sections: ResumeSection[];
  metadata?: ResumeMetadata;
}

// API Response Types
export interface CvParseResponse {
  success: boolean;
  message?: string;
  resumeData: ResumeData;
  resumeId?: string;
  detectedLanguage?: string;
  processingMethod?: string;
  confidence?: number;
  processingTimeMs?: number;
}

export interface AtsScore {
  overall: number;
  keywordMatch: number;
  skillsMatch: number;
  missingKeywords?: string[];
  suggestions?: string[];
}

export interface InterviewQuestion {
  question: string;
  hint?: string;
  category?: string;
}

export interface InterviewPrep {
  questions: InterviewQuestion[];
}

export interface RoadmapStep {
  step: string;
  timeframe?: string;
}

export interface Roadmap {
  skillGaps?: string[];
  steps: RoadmapStep[];
}

export interface CvTailorResponse {
  tailoredCv: ResumeData;
  atsScore: AtsScore;
  originalAtsScore?: AtsScore; // Score for original CV before tailoring (for before/after comparison)
  interviewPrep?: InterviewPrep;
  roadmap?: Roadmap;
  coverLetter?: string;
  processingTimeMs?: number;
}

export interface CvTailorRequest {
  resumeData: ResumeData;
  jobDescription: string;
  jobTitle?: string;
  companyName?: string;
  generateCoverLetter?: boolean;
  includeInterviewQuestions?: boolean;
  includeRoadmap?: boolean;
}

// Empty resume template for manual entry
export const emptyResumeData: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    summary: '',
    jobTitle: '',
    linkedin: '',
    website: '',
    github: '',
  },
  sections: [
    {
      id: 'exp-1',
      title: 'Work Experience',
      type: 'experience',
      items: [],
      isVisible: true,
      order: 0,
    },
    {
      id: 'edu-1',
      title: 'Education',
      type: 'education',
      items: [],
      isVisible: true,
      order: 1,
    },
    {
      id: 'skills-1',
      title: 'Skills',
      type: 'skills',
      items: [],
      isVisible: true,
      order: 2,
    },
  ],
  metadata: {
    templateId: 'modern',
    primaryColor: '#000000',
    fontFamily: 'Inter',
    language: 'en',
  },
};

// PII fields for masking (frontend knows these)
export const PII_FIELDS = [
  'personalInfo.fullName',
  'personalInfo.email',
  'personalInfo.phone',
  'personalInfo.address',
  'personalInfo.city',
  'personalInfo.country',
  'personalInfo.linkedin',
  'personalInfo.github',
  'personalInfo.website',
] as const;
