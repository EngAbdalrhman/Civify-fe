export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  summary: string;
  jobTitle: string;
  linkedin: string;
  website: string;
  github: string;
}

export interface SectionItem {
  id: string;
  title: string; // Company or School
  subtitle: string; // Job Title or Degree
  date: string;
  description: string;
  location: string;
  tags: string[];
  isVisible: boolean;
  style?: 'dots' | 'bar' | 'text';
}

export interface ResumeSection {
  id: string;
  title: string;
  type: 'experience' | 'education' | 'skills' | 'custom' | 'projects' | 'certifications';
  items: SectionItem[];
  isVisible: boolean;
  order: number;
}

export interface ResumeMetadata {
  templateId: string;
  primaryColor: string;
  fontFamily: string;
  language: string;
  customStyles: Record<string, string>;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  sections: ResumeSection[];
  metadata: ResumeMetadata;
}

export interface Resume {
  id: string;
  title: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}

export const initialResumeData: ResumeData = {
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
      id: 'exp',
      title: 'Experience',
      type: 'experience',
      items: [],
      isVisible: true,
      order: 1,
    },
    {
      id: 'edu',
      title: 'Education',
      type: 'education',
      items: [],
      isVisible: true,
      order: 2,
    },
    {
      id: 'skills',
      title: 'Skills',
      type: 'skills',
      items: [],
      isVisible: true,
      order: 3,
    },
  ],
  metadata: {
    templateId: 'modern',
    primaryColor: '#000000',
    fontFamily: 'Inter',
    language: 'en',
    customStyles: {},
  },
};
