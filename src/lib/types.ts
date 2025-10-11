// User Profile Types
export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  // License management fields
  isAdmin?: boolean;
  isLicensed?: boolean;
  licenseKey?: string;
  licenseActivatedAt?: string;
  apiKeyHash?: string;
  apiUsage?: {
    month: string; // Format: YYYY-MM
    count: number;
  };
  cvCount?: number;
  cvLimit?: number; // Custom CV limit per user
  apiUsageMonth?: string; // Current month for API usage tracking
  apiUsageCount?: number; // API usage count for current month
}

// CV Data Types.
export interface CVData {
  id: string;
  userId: string;
  fileName: string;
  rawText: string;
  fileId?: string; // Appwrite Storage file ID
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

// License Management Types
export interface LicenseKey {
  id: string;
  key: string; // Format: HICV-XXXX-XXXX-XXXX
  createdAt: string;
  createdBy: string; // Admin user ID
  activatedBy?: string; // User ID who activated the license
  activatedAt?: string;
  isActive: boolean;
  notes?: string; // Optional notes for the license
}

export interface ApiKey {
  id: string;
  userId: string;
  key: string; // The actual API key (only shown once)
  keyHash: string; // SHA-256 hash for verification
  createdAt: string;
  lastUsedAt?: string;
  isActive: boolean;
}

export interface ApiUsageLog {
  endpoint: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string; // Optional IP address
}

export interface AdminStats {
  totalUsers: number;
  licensedUsers: number;
  totalCVs: number;
  totalApiCalls: number;
  apiCallsThisMonth: number;
  activeLicenses: number;
  unusedLicenses: number;
}
