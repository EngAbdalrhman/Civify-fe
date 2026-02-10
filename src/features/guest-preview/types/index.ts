// Guest Preview Types and Sample Data

import { ResumeData, ResumeSection } from "@/features/upload-cv/types";

// Sample demo data for "Try a Sample CV" experience
export const sampleResumeData: ResumeData = {
  personalInfo: {
    fullName: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    address: "San Francisco, CA",
    jobTitle: "Senior Software Engineer",
    summary:
      "Experienced software engineer with 6+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Passionate about building scalable applications and mentoring junior developers.",
    linkedin: "linkedin.com/in/alexjohnson",
    github: "github.com/alexjohnson",
    website: "alexjohnson.dev",
  },
  sections: [
    {
      id: "exp-1",
      title: "Work Experience",
      type: "experience",
      visible: true,
      order: 0,
      items: [
        {
          id: "exp-item-1",
          title: "Senior Software Engineer",
          subtitle: "TechCorp Inc.",
          startDate: "2021-01",
          endDate: "Present",
          location: "San Francisco, CA",
          description:
            "• Led development of microservices architecture serving 2M+ users\n• Mentored team of 5 junior developers\n• Reduced API response time by 40% through optimization",
          tags: ["React", "Node.js", "AWS", "TypeScript"],
        },
        {
          id: "exp-item-2",
          title: "Software Engineer",
          subtitle: "StartupXYZ",
          startDate: "2018-06",
          endDate: "2020-12",
          location: "Remote",
          description:
            "• Built real-time collaboration features using WebSocket\n• Implemented CI/CD pipelines reducing deployment time by 60%\n• Developed REST APIs handling 100K+ requests/day",
          tags: ["JavaScript", "Python", "Docker", "PostgreSQL"],
        },
      ],
    },
    {
      id: "edu-1",
      title: "Education",
      type: "education",
      visible: true,
      order: 1,
      items: [
        {
          id: "edu-item-1",
          title: "Bachelor of Science in Computer Science",
          subtitle: "University of California, Berkeley",
          startDate: "2014-09",
          endDate: "2018-05",
          location: "Berkeley, CA",
          description:
            "GPA: 3.8/4.0 | Dean's List | Relevant Coursework: Data Structures, Algorithms, Machine Learning",
        },
      ],
    },
    {
      id: "skills-1",
      title: "Skills",
      type: "skills",
      visible: true,
      order: 2,
      items: [
        { id: "skill-1", title: "React", level: "expert" },
        { id: "skill-2", title: "TypeScript", level: "expert" },
        { id: "skill-3", title: "Node.js", level: "advanced" },
        { id: "skill-4", title: "Python", level: "advanced" },
        { id: "skill-5", title: "AWS", level: "advanced" },
        { id: "skill-6", title: "Docker", level: "intermediate" },
        { id: "skill-7", title: "PostgreSQL", level: "advanced" },
        { id: "skill-8", title: "GraphQL", level: "intermediate" },
      ],
    },
    {
      id: "lang-1",
      title: "Languages",
      type: "languages",
      visible: true,
      order: 3,
      items: [
        { id: "lang-1", title: "English", level: "native" as any },
        { id: "lang-2", title: "Spanish", level: "intermediate" },
      ],
    },
  ],
  metadata: {
    templateId: "modern",
    primaryColor: "#2563eb",
    fontFamily: "Inter",
    language: "en",
    skillsDisplayStyle: "tags",
    languagesDisplayStyle: "level",
  },
};

// Sample job description for demo
export const sampleJobDescription = `Senior Full-Stack Engineer

About the Role:
We're looking for a Senior Full-Stack Engineer to join our growing engineering team. You'll work on building scalable web applications that serve millions of users worldwide.

Requirements:
- 5+ years of experience in software development
- Strong proficiency in React, TypeScript, and Node.js
- Experience with cloud platforms (AWS, GCP, or Azure)
- Knowledge of database design and SQL/NoSQL databases
- Experience with RESTful APIs and microservices architecture
- Familiarity with CI/CD pipelines and DevOps practices
- Strong problem-solving and communication skills

Nice to have:
- Experience with GraphQL
- Knowledge of Kubernetes and Docker
- Experience mentoring junior developers
- Contributions to open source projects

Benefits:
- Competitive salary and equity
- Remote-first culture
- Health insurance
- Learning and development budget
- Flexible working hours`;

// Extracted skills from job description (simulated)
export interface ExtractedSkills {
  required: string[];
  preferred: string[];
  matched: string[];
  missing: string[];
}

export const sampleExtractedSkills: ExtractedSkills = {
  required: [
    "React",
    "TypeScript",
    "Node.js",
    "AWS",
    "SQL",
    "REST APIs",
    "Microservices",
    "CI/CD",
  ],
  preferred: ["GraphQL", "Kubernetes", "Docker", "Open Source"],
  matched: [
    "React",
    "TypeScript",
    "Node.js",
    "AWS",
    "Docker",
    "GraphQL",
    "PostgreSQL",
  ],
  missing: ["Kubernetes", "Azure", "GCP"],
};

// Guest preview state types
export interface GuestPreviewState {
  step: "input" | "preview" | "signup";
  jobDescription: string;
  extractedSkills: ExtractedSkills | null;
  matchScore: number | null;
  isLoading: boolean;
}

// Partial match score simulation
export const calculateDemoMatchScore = (
  extractedSkills: ExtractedSkills,
): number => {
  const totalRequired = extractedSkills.required.length;
  const matchedCount = extractedSkills.matched.filter((skill) =>
    extractedSkills.required.includes(skill),
  ).length;

  // Base score from required skills
  const baseScore = Math.round((matchedCount / totalRequired) * 70);

  // Bonus for preferred skills
  const preferredMatched = extractedSkills.matched.filter((skill) =>
    extractedSkills.preferred.includes(skill),
  ).length;
  const bonus = Math.round(
    (preferredMatched / extractedSkills.preferred.length) * 22,
  );

  return Math.min(baseScore + bonus + 8, 95); // Cap at 95 for demo
};
