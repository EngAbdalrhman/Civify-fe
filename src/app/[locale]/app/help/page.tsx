"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { 
  HelpCircle, 
  FileText, 
  Mail, 
  MessageCircle,
  ExternalLink,
  BookOpen,
  Zap,
  Shield
} from "lucide-react";

export default function HelpPage() {
  const t = useTranslations("common");

  const helpSections = [
    {
      icon: FileText,
      title: "Getting Started",
      description: "Learn the basics of uploading and tailoring your CV",
      links: [
        { label: "Upload your first CV", href: "/app/upload" },
        { label: "How CV tailoring works", href: "#" },
        { label: "Understanding ATS scores", href: "#" },
      ]
    },
    {
      icon: Zap,
      title: "Features",
      description: "Explore all the tools available to optimize your CV",
      links: [
        { label: "AI-powered optimization", href: "#" },
        { label: "Personal info masking", href: "#" },
        { label: "Export options (PDF/DOCX)", href: "#" },
      ]
    },
    {
      icon: Shield,
      title: "Account & Security",
      description: "Manage your account settings and security",
      links: [
        { label: "Change password", href: "/app/settings" },
        { label: "Two-factor authentication", href: "/app/settings" },
        { label: "API key management", href: "/app/api-keys" },
      ]
    },
    {
      icon: BookOpen,
      title: "API Documentation",
      description: "For developers integrating with our API",
      links: [
        { label: "API reference", href: "/app/api-documentation" },
        { label: "Authentication guide", href: "/app/api-documentation" },
        { label: "Rate limits", href: "/app/api-documentation" },
      ]
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Find answers to common questions and learn how to get the most out of Civify
        </p>
      </div>

      {/* Help Sections Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {helpSections.map((section) => (
          <div key={section.title} className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>
            <ul className="space-y-2 pl-12">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {link.label}
                    {link.href.startsWith("http") && <ExternalLink className="h-3 w-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="rounded-lg border bg-muted/30 p-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Still need help?</h2>
          <p className="text-muted-foreground">
            Our support team is here to assist you with any questions
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="mailto:support@civify.cv" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </a>
            <a 
              href="#" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-muted transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Live Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
