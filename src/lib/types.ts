// User Profile Types
export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
}

// CV Data Types.
export interface CVData {
  id: string;
  userId: string;
  fileName: string;
  rawText: string;
  structuredData: StructuredCVData | null;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface StructuredCVData {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  certifications?: CertificationItem[];
  languages?: LanguageItem[];
  projects?: ProjectItem[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies?: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  honors?: string[];
  relevantCourses?: string[];
}

export interface SkillCategory {
  id: string;
  category: string;
  skills: string[];
  proficiencyLevel?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  url?: string;
  repository?: string;
  achievements: string[];
}

// Job Application Types
export interface JobApplication {
  id: string;
  userId: string;
  cvId: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  tailoredCV?: string;
  coverLetter?: string;
  applicationStatus:
    | "draft"
    | "applied"
    | "interview"
    | "rejected"
    | "accepted";
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Generated Content Types
export interface GeneratedContent {
  id: string;
  userId: string;
  cvId: string;
  jobApplicationId?: string;
  type: "tailored_cv" | "cover_letter" | "summary" | "skills_match";
  content: string;
  prompt: string;
  createdAt: string;
  feedback?: ContentFeedback;
}

export interface ContentFeedback {
  rating: 1 | 2 | 3 | 4 | 5;
  comments?: string;
  improvements?: string[];
  createdAt: string;
}

// Database Structure Types
export interface UserData {
  profile: UserProfile;
  cvs: Record<string, CVData>;
  jobApplications: Record<string, JobApplication>;
  generatedContent: Record<string, GeneratedContent>;
  settings: UserSettings;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    browser: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    saveHistory: boolean;
  };
  preferences: {
    defaultCVFormat: string;
    autoSave: boolean;
    saveToCloud: boolean;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Data Types (for compatibility with existing code)
export interface FormData {
  cvFileName: string;
  rawCvText: string;
  structuredCvData: StructuredCVData | null;
  profile: UserProfile;
  jobDescription: string;
  generateCoverLetter: boolean;
}
