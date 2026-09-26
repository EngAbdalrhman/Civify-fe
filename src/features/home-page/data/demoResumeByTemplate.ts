import type { ResumeData } from "@/features/upload-cv/types";

const DEMO_PERSONAL = {
  fullName: "Alex Morgan",
  email: "alex.morgan@email.com",
  phone: "+1 (555) 123-4567",
  city: "San Francisco",
  country: "USA",
  jobTitle: "Software Engineer",
  summary:
    "Full-stack engineer with 5+ years building scalable web applications. Focused on clean APIs, performance, and user-centric product delivery.",
  linkedin: "linkedin.com/in/alexmorgan",
};

const DEMO_SECTIONS: ResumeData["sections"] = [
  {
    id: "demo-exp",
    title: "Experience",
    type: "experience",
    isVisible: true,
    order: 0,
    items: [
      {
        id: "demo-exp-1",
        title: "Senior Software Engineer",
        subtitle: "TechCorp Inc.",
        date: "2021 – Present",
        description:
          "Led migration to Next.js; improved page load times by 40%. Mentored 3 junior developers.",
        isVisible: true,
      },
      {
        id: "demo-exp-2",
        title: "Software Engineer",
        subtitle: "StartupXYZ",
        date: "2019 – 2021",
        description:
          "Built REST APIs and CI pipelines. Shipped features used by 50k+ monthly active users.",
        isVisible: true,
      },
    ],
  },
  {
    id: "demo-edu",
    title: "Education",
    type: "education",
    isVisible: true,
    order: 1,
    items: [
      {
        id: "demo-edu-1",
        title: "B.S. Computer Science",
        subtitle: "State University",
        date: "2015 – 2019",
        isVisible: true,
      },
    ],
  },
  {
    id: "demo-skills",
    title: "Skills",
    type: "skills",
    isVisible: true,
    order: 2,
    items: [
      {
        id: "demo-sk-1",
        title: "TypeScript, React, Node.js, PostgreSQL, AWS",
        isVisible: true,
      },
    ],
  },
];

const TEMPLATE_COLORS: Record<string, string> = {
  modern: "#2563eb",
  classic: "#1e293b",
  minimal: "#0f172a",
  executive: "#1e3a5f",
  creative: "#7c3aed",
};

export const LANDING_TEMPLATE_IDS = [
  "modern",
  "classic",
  "minimal",
  "executive",
  "creative",
] as const;

export type LandingTemplateId = (typeof LANDING_TEMPLATE_IDS)[number];

export function getDemoResumeForTemplate(
  templateId: LandingTemplateId,
): ResumeData {
  return {
    personalInfo: { ...DEMO_PERSONAL },
    sections: DEMO_SECTIONS.map((s) => ({
      ...s,
      items: s.items.map((item) => ({ ...item })),
    })),
    metadata: {
      templateId,
      primaryColor: TEMPLATE_COLORS[templateId] ?? "#000000",
      fontFamily: "Arial",
      bodyFontFamily: "Arial",
      headingFontFamily: "Arial",
      language: "en",
    },
  };
}
