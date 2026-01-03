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
  Shield,
  ChevronRight,
  Search,
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  const t = useTranslations("help");

  const helpSections = [
    {
      icon: FileText,
      titleKey: "gettingStarted.title",
      descKey: "gettingStarted.desc",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      links: [
        { labelKey: "gettingStarted.createFirstCv", href: "/app/resume-builder" },
        { labelKey: "gettingStarted.tailorFirstCv", href: "/app/upload" },
        { labelKey: "gettingStarted.howTailoringWorks", href: "#" },
        { labelKey: "gettingStarted.understandingAts", href: "#" },
      ]
    },
    {
      icon: Zap,
      titleKey: "features.title",
      descKey: "features.desc",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      links: [
        { labelKey: "features.aiOptimization", href: "#" },
        { labelKey: "features.infoMasking", href: "#" },
        { labelKey: "features.exportOptions", href: "#" },
      ]
    },
    {
      icon: Shield,
      titleKey: "account.title",
      descKey: "account.desc",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      links: [
        { labelKey: "account.changePassword", href: "/app/settings" },
        { labelKey: "account.twoFactor", href: "/app/settings" },
        { labelKey: "account.apiKeyManagement", href: "/app/api-keys" },
      ]
    },
    {
      icon: BookOpen,
      titleKey: "apiDocs.title",
      descKey: "apiDocs.desc",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      links: [
        { labelKey: "apiDocs.apiReference", href: "/app/api-documentation" },
        { labelKey: "apiDocs.authGuide", href: "/app/api-documentation" },
        { labelKey: "apiDocs.rateLimits", href: "/app/api-documentation" },
      ]
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="text-center py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 -z-10" />
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6 shadow-lg shadow-primary/25">
          <HelpCircle className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{t("title")}</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto mt-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search for help topics..." 
            className="pl-10 h-12 text-base border-2 focus:border-primary"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2 hover:border-primary/50 transition-all group cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-1">Video Tutorials</h3>
            <p className="text-sm text-muted-foreground">Watch step-by-step guides</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-all group cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-semibold mb-1">Knowledge Base</h3>
            <p className="text-sm text-muted-foreground">Browse all articles</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-all group cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-3 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="font-semibold mb-1">Quick Start</h3>
            <p className="text-sm text-muted-foreground">Get started in 5 minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Help Sections Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {helpSections.map((section) => (
          <Card key={section.titleKey} className="overflow-hidden border-2 hover:shadow-lg transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${section.bgColor}`}>
                  <section.icon className={`h-6 w-6 bg-gradient-to-r ${section.color} bg-clip-text`} style={{color: 'transparent', backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`}} />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-xl">{t(section.titleKey)}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{t(section.descKey)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link 
                      href={link.href} 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {t(link.labelKey)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Section */}
      <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 overflow-hidden">
        <CardContent className="py-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t("contact.title")}</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                {t("contact.desc")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="min-w-[160px]" asChild>
                <a href="mailto:support@civify.cv">
                  <Mail className="h-4 w-4 mr-2" />
                  {t("contact.contactSupport")}
                </a>
              </Button>
              <Button size="lg" variant="outline" className="min-w-[160px]">
                <MessageCircle className="h-4 w-4 mr-2" />
                {t("contact.liveChat")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
