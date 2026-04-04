"use client";

import { useState, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  HelpCircle,
  FileText,
  Mail,
  MessageCircle,
  BookOpen,
  Zap,
  Shield,
  Search,
  Sparkles,
  ChevronRight,
  ArrowRight,
  SearchX,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface HelpArticle {
  id: string;
  labelKey: string;
  bodyKey: string;
  keywordsKey?: string;
  href: string;
}

interface HelpSection {
  id: string;
  icon: typeof FileText;
  titleKey: string;
  descKey: string;
  color: string;
  bgColor: string;
  iconColor: string;
  articles: HelpArticle[];
}

export default function HelpPage() {
  const t = useTranslations("help");
  const [searchQuery, setSearchQuery] = useState("");
  const sectionsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const helpSections: HelpSection[] = [
    {
      id: "gettingStarted",
      icon: FileText,
      titleKey: "gettingStarted.title",
      descKey: "gettingStarted.desc",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
      articles: [
        {
          id: "createFirstCv",
          labelKey: "gettingStarted.createFirstCv",
          bodyKey: "gettingStarted.createFirstCvBody",
          keywordsKey: "gettingStarted.createFirstCvKeywords",
          href: "/app/resume-builder",
        },
        {
          id: "tailorFirstCv",
          labelKey: "gettingStarted.tailorFirstCv",
          bodyKey: "gettingStarted.tailorFirstCvBody",
          keywordsKey: "gettingStarted.tailorFirstCvKeywords",
          href: "/app/upload",
        },
        {
          id: "howTailoringWorks",
          labelKey: "gettingStarted.howTailoringWorks",
          bodyKey: "gettingStarted.howTailoringWorksBody",
          keywordsKey: "gettingStarted.howTailoringWorksKeywords",
          href: "#",
        },
        {
          id: "understandingAts",
          labelKey: "gettingStarted.understandingAts",
          bodyKey: "gettingStarted.understandingAtsBody",
          href: "#",
        },
      ],
    },
    {
      id: "features",
      icon: Zap,
      titleKey: "features.title",
      descKey: "features.desc",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-500",
      articles: [
        {
          id: "aiOptimization",
          labelKey: "features.aiOptimization",
          bodyKey: "features.aiOptimizationBody",
          keywordsKey: "features.aiOptimizationKeywords",
          href: "#",
        },
        {
          id: "infoMasking",
          labelKey: "features.infoMasking",
          bodyKey: "features.infoMaskingBody",
          keywordsKey: "features.infoMaskingKeywords",
          href: "#",
        },
        {
          id: "exportOptions",
          labelKey: "features.exportOptions",
          bodyKey: "features.exportOptionsBody",
          keywordsKey: "features.exportOptionsKeywords",
          href: "#",
        },
        {
          id: "resumeBuilder",
          labelKey: "features.resumeBuilder",
          bodyKey: "features.resumeBuilderBody",
          keywordsKey: "features.resumeBuilderKeywords",
          href: "/app/resume-builder",
        },
        {
          id: "chromeExtension",
          labelKey: "features.chromeExtension",
          bodyKey: "features.chromeExtensionBody",
          keywordsKey: "features.chromeExtensionKeywords",
          href: "#",
        },
      ],
    },
    {
      id: "account",
      icon: Shield,
      titleKey: "account.title",
      descKey: "account.desc",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-500",
      articles: [
        {
          id: "changePassword",
          labelKey: "account.changePassword",
          bodyKey: "account.changePasswordBody",
          keywordsKey: "account.changePasswordKeywords",
          href: "/app/settings",
        },
        {
          id: "twoFactor",
          labelKey: "account.twoFactor",
          bodyKey: "account.twoFactorBody",
          keywordsKey: "account.twoFactorKeywords",
          href: "/app/settings",
        },
        {
          id: "apiKeyManagement",
          labelKey: "account.apiKeyManagement",
          bodyKey: "account.apiKeyManagementBody",
          keywordsKey: "account.apiKeyManagementKeywords",
          href: "/app/api-keys",
        },
        {
          id: "subscription",
          labelKey: "account.subscription",
          bodyKey: "account.subscriptionBody",
          keywordsKey: "account.subscriptionKeywords",
          href: "/app/billing",
        },
      ],
    },
    {
      id: "apiDocs",
      icon: BookOpen,
      titleKey: "apiDocs.title",
      descKey: "apiDocs.desc",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
      articles: [
        {
          id: "apiReference",
          labelKey: "apiDocs.apiReference",
          bodyKey: "apiDocs.apiReferenceBody",
          keywordsKey: "apiDocs.apiReferenceKeywords",
          href: "/app/api-documentation",
        },
        {
          id: "authGuide",
          labelKey: "apiDocs.authGuide",
          bodyKey: "apiDocs.authGuideBody",
          keywordsKey: "apiDocs.authGuideKeywords",
          href: "/app/api-documentation",
        },
        {
          id: "rateLimits",
          labelKey: "apiDocs.rateLimits",
          bodyKey: "apiDocs.rateLimitsBody",
          keywordsKey: "apiDocs.rateLimitsKeywords",
          href: "/app/api-documentation",
        },
      ],
    },
  ];

  // Filter sections and articles based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return helpSections;

    const query = searchQuery.toLowerCase().trim();

    return helpSections
      .map((section) => {
        const sectionMatches =
          t(section.titleKey).toLowerCase().includes(query) ||
          t(section.descKey).toLowerCase().includes(query);

        const matchedArticles = section.articles.filter((article) => {
          const titleMatch = t(article.labelKey).toLowerCase().includes(query);
          const bodyMatch = t(article.bodyKey).toLowerCase().includes(query);
          const keywordsMatch = article.keywordsKey
            ? t(article.keywordsKey).toLowerCase().includes(query)
            : false;
          return titleMatch || bodyMatch || keywordsMatch;
        });

        if (sectionMatches) return section;
        if (matchedArticles.length > 0) {
          return { ...section, articles: matchedArticles };
        }
        return null;
      })
      .filter(Boolean) as HelpSection[];
  }, [searchQuery, helpSections, t]);

  const scrollToSection = (sectionId: string) => {
    const el = sectionsRef.current[sectionId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const hasResults = filteredSections.length > 0;

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-10 rtl:pl-4 rtl:pr-10 h-12 text-base border-2 focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rtl:right-auto rtl:left-3"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions — hide when searching */}
      {!searchQuery && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            className="border-2 hover:border-primary/50 transition-all group cursor-pointer"
            onClick={() => scrollToSection("gettingStarted")}
          >
            <CardContent className="pt-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-3 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="font-semibold mb-1">Quick Start</h3>
              <p className="text-sm text-muted-foreground">
                Get started in 5 minutes
              </p>
            </CardContent>
          </Card>
          <Card
            className="border-2 hover:border-primary/50 transition-all group cursor-pointer"
            onClick={() => scrollToSection("features")}
          >
            <CardContent className="pt-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-1">Features Guide</h3>
              <p className="text-sm text-muted-foreground">
                Explore all tools & features
              </p>
            </CardContent>
          </Card>
          <Card
            className="border-2 hover:border-primary/50 transition-all group cursor-pointer"
            onClick={() => scrollToSection("account")}
          >
            <CardContent className="pt-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-3 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-1">Account & Security</h3>
              <p className="text-sm text-muted-foreground">
                Manage your settings
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Results */}
      {!hasResults && searchQuery && (
        <div className="text-center py-16">
          <SearchX className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t("noResults")}</h3>
          <p className="text-muted-foreground">{t("noResultsHint")}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSearchQuery("")}
          >
            Clear Search
          </Button>
        </div>
      )}

      {/* Help Sections Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredSections.map((section) => (
          <Card
            key={section.id}
            ref={(el) => {
              sectionsRef.current[section.id] = el;
            }}
            className="overflow-hidden border-2 hover:shadow-lg transition-all"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${section.bgColor}`}>
                  <section.icon className={`h-6 w-6 ${section.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-xl">{t(section.titleKey)}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(section.descKey)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Accordion type="single" collapsible className="w-full">
                {section.articles.map((article) => (
                  <AccordionItem
                    key={article.id}
                    value={article.id}
                    className="border-b-0"
                  >
                    <AccordionTrigger className="py-3 px-3 rounded-lg hover:bg-muted/50 hover:no-underline transition-colors text-sm font-medium text-muted-foreground hover:text-foreground">
                      {t(article.labelKey)}
                    </AccordionTrigger>
                    <AccordionContent className="px-3">
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t(article.bodyKey)}
                        </p>
                        {article.href !== "#" && (
                          <Link
                            href={article.href}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            Go to {t(article.labelKey)}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
