import type {
  Feature,
  Template,
  Testimonial,
  PricingTier,
  FAQ,
  Integration,
  BlogPost,
  RoleCategory,
  HowItWorksStep,
} from "../types";

export const howItWorksSteps: HowItWorksStep[] = [
  {
    step: 1,
    title: "Upload Your CV",
    description: "Start from scratch or upload your existing CV in any format",
    icon: "Upload",
  },
  {
    step: 2,
    title: "Paste Job Description",
    description: "Copy and paste the job description or select a role category",
    icon: "FileText",
  },
  {
    step: 3,
    title: "AI Analysis",
    description: "Civify analyzes ATS keywords and role requirements instantly",
    icon: "Sparkles",
  },
  {
    step: 4,
    title: "Download Optimized CV",
    description: "Get your polished, tailored CV with optimization score",
    icon: "Download",
  },
];

export const features: Feature[] = [
  {
    icon: "Search",
    title: "AI Job Description Parser",
    description: "Extracts required skills & keywords for better match with job postings",
  },
  {
    icon: "Target",
    title: "ATS Optimization Engine",
    description: "Ensures formatting & keyword density match ATS standards for maximum visibility",
  },
  {
    icon: "LayoutTemplate",
    title: "Role-Based CV Templates",
    description: "Developer, Designer, Data Analyst, HR, Marketing, Sales, and more specialized templates",
  },
  {
    icon: "Wand2",
    title: "Achievement Rewriting with AI",
    description: "Turns simple tasks into quantifiable impact statements that impress recruiters",
  },
  {
    icon: "TrendingUp",
    title: "Skill Gap Suggestions",
    description: "Shows missing skills and recommends additions based on job requirements",
  },
  {
    icon: "Globe",
    title: "Full Arabic Support 🇸🇦",
    description: "Native RTL support, Arabic OCR for scanned documents, and bilingual CV generation",
  },
  {
    icon: "Gauge",
    title: "Real-time Score Indicator",
    description: "Displays CV Match Score before download so you know exactly where you stand",
  },
  {
    icon: "Download",
    title: "CV Masking & Privacy",
    description: "Protect your personal info when sharing CVs—mask emails, phones, and addresses",
  },
];

export const templates: Template[] = [
  {
    id: "ats-clean",
    name: "Clean ATS",
    category: "Professional",
    image: "/templates/ats-clean.png",
    description: "Simple, scannable format optimized for applicant tracking systems",
    atsCompliant: true,
  },
  {
    id: "professional",
    name: "Professional",
    category: "Business",
    image: "/templates/professional.png",
    description: "Elegant design perfect for corporate and traditional industries",
    atsCompliant: true,
  },
  {
    id: "minimalist",
    name: "Minimalist",
    category: "Modern",
    image: "/templates/minimalist.png",
    description: "Ultra-clean design with sophisticated use of white space",
    atsCompliant: true,
  },
  {
    id: "modern",
    name: "Modern",
    category: "Creative",
    image: "/templates/modern.png",
    description: "Contemporary design with geometric elements and bold typography",
    atsCompliant: true,
  },
  {
    id: "technical",
    name: "Technical",
    category: "Tech",
    image: "/templates/technical.png",
    description: "Developer-focused with skills matrix and GitHub-style layout",
    atsCompliant: true,
  },
  {
    id: "creative",
    name: "Creative",
    category: "Design",
    image: "/templates/creative.png",
    description: "Artistic layout for designers and creative professionals",
    atsCompliant: true,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "Google",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 5,
    quote: "Got 3 interviews in 2 weeks after using Civify. The ATS optimization really works!",
    successMetric: "3 interviews in 2 weeks",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Product Manager",
    company: "Microsoft",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 5,
    quote: "The AI rewriting feature transformed my generic bullet points into powerful achievements. Landed my dream job!",
    successMetric: "Landed dream job",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Data Analyst",
    company: "Amazon",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    rating: 5,
    quote: "My CV match score went from 45% to 92%. The skill gap suggestions were incredibly helpful.",
    successMetric: "92% match score",
  },
  {
    id: "4",
    name: "David Kim",
    role: "Marketing Manager",
    company: "Meta",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 5,
    quote: "Finally, a CV tool that understands what recruiters actually look for. Worth every penny!",
  },
];

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "1 CV generation per month",
      "Basic templates",
      "ATS optimization",
      "PDF export",
      "Match score indicator",
    ],
    cta: "Get Started",
    ctaLink: "/signup",
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    period: "month",
    description: "For active job seekers",
    features: [
      "Unlimited CV generations",
      "All premium templates",
      "AI achievement rewriting",
      "Skill gap analysis",
      "Multiple export formats",
      "Priority support",
      "LinkedIn optimization",
    ],
    highlighted: true,
    cta: "Start Free Trial",
    ctaLink: "/signup?plan=pro",
  },
  {
    id: "premium",
    name: "Premium",
    price: 49,
    period: "month",
    description: "Complete career toolkit",
    features: [
      "Everything in Pro",
      "AI cover letter generator",
      "Portfolio optimization",
      "Interview preparation AI",
      "Career coaching sessions",
      "Job application tracker",
      "Salary negotiation guide",
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup?plan=premium",
  },
];

export const faqs: FAQ[] = [
  {
    id: "1",
    question: "Is my data private?",
    answer: "Absolutely. We use enterprise-grade encryption and never share your personal information with third parties. Your CV data is stored securely and you can delete it anytime.",
  },
  {
    id: "2",
    question: "What makes a CV ATS-friendly?",
    answer: "ATS (Applicant Tracking Systems) scan CVs for specific keywords, proper formatting, and standard section headers. Our templates are designed to pass ATS scans while still looking professional to human recruiters.",
  },
  {
    id: "3",
    question: "Can I customize the CV manually?",
    answer: "Yes! After AI optimization, you have full control to edit any section, adjust formatting, and customize the content to match your personal style.",
  },
  {
    id: "4",
    question: "Do you save my documents?",
    answer: "Your CVs are saved securely in your account so you can access and edit them anytime. You can also download them locally and delete them from our servers whenever you want.",
  },
  {
    id: "5",
    question: "How accurate is the match score?",
    answer: "Our match score is based on industry-standard ATS algorithms and keyword analysis. While no score is 100% predictive, our users report significantly higher interview rates with scores above 80%.",
  },
];

export const integrations: Integration[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "Linkedin",
    description: "Import your profile data instantly",
  },
  {
    id: "google-docs",
    name: "Google Docs",
    icon: "FileText",
    description: "Export and edit in Google Docs",
  },
  {
    id: "word",
    name: "Microsoft Word",
    icon: "FileText",
    description: "Download in .docx format",
  },
  {
    id: "indeed",
    name: "Indeed",
    icon: "Briefcase",
    description: "Optimize for Indeed applications",
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    icon: "Briefcase",
    description: "Tailor for Glassdoor postings",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    icon: "Cloud",
    description: "Save directly to Drive",
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "How to Write an ATS-Friendly CV in 2025",
    excerpt: "Learn the essential strategies to ensure your CV passes applicant tracking systems and reaches human recruiters.",
    image: "/blog/ats-friendly.jpg",
    readTime: "5 min read",
    slug: "ats-friendly-cv-2025",
  },
  {
    id: "2",
    title: "Top Keywords for Software Engineering Roles in 2025",
    excerpt: "Discover the most important keywords and skills that tech recruiters are looking for this year.",
    image: "/blog/tech-keywords.jpg",
    readTime: "7 min read",
    slug: "software-engineering-keywords-2025",
  },
  {
    id: "3",
    title: "How to Tailor Your CV to Job Descriptions",
    excerpt: "A step-by-step guide to customizing your CV for each application to maximize your chances of getting interviews.",
    image: "/blog/tailor-cv.jpg",
    readTime: "6 min read",
    slug: "tailor-cv-job-descriptions",
  },
];

export const roleCategories: RoleCategory[] = [
  {
    id: "software-engineer",
    name: "Software Engineer",
    icon: "Code",
    keywords: ["JavaScript", "Python", "React", "Node.js", "AWS", "Docker", "Git", "Agile"],
    industryLanguage: ["Full-stack development", "Microservices", "CI/CD", "RESTful APIs"],
    examples: [
      "Developed scalable web applications serving 1M+ users",
      "Reduced API response time by 40% through optimization",
    ],
  },
  {
    id: "data-scientist",
    name: "Data Scientist",
    icon: "BarChart",
    keywords: ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas", "Statistics"],
    industryLanguage: ["Predictive modeling", "Data visualization", "A/B testing", "ETL pipelines"],
    examples: [
      "Built ML models improving prediction accuracy by 25%",
      "Analyzed datasets of 10M+ records to drive business insights",
    ],
  },
  {
    id: "product-manager",
    name: "Product Manager",
    icon: "Lightbulb",
    keywords: ["Product Strategy", "Roadmap", "Stakeholder Management", "Analytics", "Agile"],
    industryLanguage: ["Product-market fit", "User stories", "KPIs", "Go-to-market strategy"],
    examples: [
      "Launched 5 features increasing user engagement by 35%",
      "Managed cross-functional teams of 15+ members",
    ],
  },
  {
    id: "accountant",
    name: "Accountant",
    icon: "Calculator",
    keywords: ["QuickBooks", "Excel", "GAAP", "Financial Reporting", "Tax Preparation"],
    industryLanguage: ["General ledger", "Reconciliation", "Audit", "Compliance"],
    examples: [
      "Managed accounts payable/receivable for $5M budget",
      "Reduced month-end close time by 30%",
    ],
  },
  {
    id: "customer-support",
    name: "Customer Support",
    icon: "Headphones",
    keywords: ["Zendesk", "Customer Service", "Communication", "Problem Solving", "CRM"],
    industryLanguage: ["Ticket resolution", "Customer satisfaction", "SLA", "Escalation"],
    examples: [
      "Maintained 95% customer satisfaction rating",
      "Resolved 50+ tickets daily with 2-hour average response time",
    ],
  },
  {
    id: "sales-rep",
    name: "Sales Representative",
    icon: "TrendingUp",
    keywords: ["Salesforce", "Lead Generation", "Negotiation", "B2B Sales", "CRM"],
    industryLanguage: ["Pipeline management", "Quota attainment", "Cold calling", "Account management"],
    examples: [
      "Exceeded sales quota by 120% for 3 consecutive quarters",
      "Generated $2M in new business revenue",
    ],
  },
  {
    id: "marketing-specialist",
    name: "Marketing Specialist",
    icon: "Megaphone",
    keywords: ["SEO", "Google Analytics", "Content Marketing", "Social Media", "Email Campaigns"],
    industryLanguage: ["Brand awareness", "Lead generation", "Conversion rate", "Marketing automation"],
    examples: [
      "Increased organic traffic by 150% through SEO optimization",
      "Managed campaigns generating 10K+ qualified leads",
    ],
  },
  {
    id: "project-manager",
    name: "Project Manager",
    icon: "ClipboardList",
    keywords: ["PMP", "Agile", "Scrum", "Risk Management", "Budget Management", "Jira"],
    industryLanguage: ["Project lifecycle", "Stakeholder engagement", "Resource allocation", "Deliverables"],
    examples: [
      "Delivered 20+ projects on time and under budget",
      "Managed project portfolios worth $10M+",
    ],
  },
];
