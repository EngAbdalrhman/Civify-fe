export interface HomepageTypes {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
  };
  reviews?: {
    count: number;
    rating?: number;
    avatars: {
      src: string;
      alt: string;
    }[];
  };
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  atsCompliant: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  quote: string;
  successMetric?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  ctaLink: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  slug: string;
}

export interface RoleCategory {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
  industryLanguage: string[];
  examples: string[];
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}
