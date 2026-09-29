"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Copy,
  Check,
  Sparkles,
  Terminal,
  Bot,
  Zap,
  Shield,
  Key,
  Globe,
  Server,
  ExternalLink,
  Languages,
  HelpCircle,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

interface ToolParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface McpTool {
  name: string;
  category: "auth" | "pay_per_cv" | "resume_ai" | "kanban";
  categoryLabel: string;
  description: string;
  authRequired: boolean;
  isPublic?: boolean;
  samplePrompt: string;
  parameters: ToolParam[];
}

const MCP_TOOLS: McpTool[] = [
  {
    name: "civify_get_started", category: "auth", categoryLabel: "Getting Started",
    description: "Discover account linking, attachment inputs, credits and the shortest workflow for your task.",
    authRequired: false, isPublic: true, samplePrompt: "Help me use my attached CV with Civify.", parameters: [],
  },
  {
    name: "civify_get_account",
    category: "auth",
    categoryLabel: "Auth & Account",
    description: "Retrieve candidate profile, active plan, remaining AI tokens, and purchased CV pass credits.",
    authRequired: true,
    samplePrompt: "Check my Civify account profile and see how many AI tokens and credits I have left.",
    parameters: [
    ],
  },

  // ─── Pay-Per-CV & Monetization ─────────────────────────────────────────
  {
    name: "civify_get_pay_per_cv_pricing",
    category: "pay_per_cv",
    categoryLabel: "Pay-Per-CV",
    description: "Get localized single CV unlock pricing and package discounts (USD and EGP regional rates based on GeoIP).",
    authRequired: false,
    isPublic: true,
    samplePrompt: "Show me the pricing for unlocking a single CV pass on Civify.",
    parameters: [],
  },
  {
    name: "civify_purchase_cv_pass",
    category: "pay_per_cv",
    categoryLabel: "Pay-Per-CV",
    description: "Initiate payment to unlock a single CV or a 3-pack pass. Returns a secure checkout URL (Credit Card or Mobile Wallet).",
    authRequired: true,
    samplePrompt: "I want to purchase a single CV pass for resume ID 104829 using card payment.",
    parameters: [
      { name: "product_id", type: "string", required: false, description: "Pay-per-CV product ID (default: PAY_PER_CV_SINGLE)." },
      { name: "resume_id", type: "string", required: false, description: "Target CV ID to bind this entitlement to." },
      { name: "gateway", type: "string", required: false, description: "Optional payment gateway selection." },
      { name: "method", type: "string", required: false, description: "'CARD' or 'WALLET' (default: CARD)." },
      { name: "phone_number", type: "string", required: false, description: "Phone number when the selected gateway requires it." },
      { name: "promo_code", type: "string", required: false, description: "Optional promotional code." },
    ],
  },
  {
    name: "civify_check_cv_entitlement",
    category: "pay_per_cv",
    categoryLabel: "Pay-Per-CV",
    description: "Verify if a CV has an active 30-day unwatermarked pass, allowing watermark-free export and AI tailoring.",
    authRequired: true,
    samplePrompt: "Check if my CV with ID 104829 is unlocked for full export.",
    parameters: [
      { name: "resume_id", type: "string", required: true, description: "Civify resume ID to check." },
    ],
  },

  // ─── Resume AI & ATS ───────────────────────────────────────────────────
  {
    name: "civify_scrape_job",
    category: "resume_ai",
    categoryLabel: "Resume AI",
    description: "Extract clean job requirements, title, company, and qualifications from any job posting URL (LinkedIn, Greenhouse, Lever, etc.).",
    authRequired: false,
    isPublic: true,
    samplePrompt: "Scrape the job requirements from this URL: https://boards.greenhouse.io/anthropic/jobs/529104.",
    parameters: [
      { name: "url", type: "string", required: true, description: "Public URL of the job description." },
    ],
  },
  {
    name: "civify_parse_cv",
    category: "resume_ai",
    categoryLabel: "Resume AI",
    description: "Parse a PDF, DOCX, or image resume into structured JSON schema (contact, work experience, education, skills).",
    authRequired: true,
    samplePrompt: "Parse my attached CV into structured JSON format.",
    parameters: [
      { name: "file", type: "object", required: false, description: "Native ChatGPT attachment with download_url and file_id." },
      { name: "file_url", type: "string", required: false, description: "Actual client-provided HTTPS download URL; never a sandbox path." },
      { name: "resume_text", type: "string", required: false, description: "Plain-text or Markdown resume content; best for an AI chat." },
      { name: "file_base64", type: "string", required: false, description: "Actual base64 bytes when the client can supply them; prefer file or extracted text." },
      { name: "filename", type: "string", required: false, description: "Original filename with extension (e.g. resume.pdf)." },
      { name: "language", type: "string", required: false, description: "Language hint (e.g. 'en', 'ar')." },
    ],
  },
  {
    name: "civify_tailor_cv",
    category: "resume_ai",
    categoryLabel: "Resume AI",
    description: "Tailor structured CV data or an attached original to a job and return a finished PDF by default. Parsing is optional. If export fails, reuse tailoredCv with civify_generate_pdf.",
    authRequired: true,
    samplePrompt: "Tailor my attached resume for this job description: 'Seeking Senior Fullstack Engineer with Next.js and Spring Boot...'. Generate a cover letter too.",
    parameters: [
      { name: "job_description", type: "string", required: true, description: "Target job description text or scraped requirements." },
      { name: "resume_data", type: "object", required: false, description: "Canonical personalInfo and sections from the agent or Civify. Avoids parsing again; use instead of an original file/text input." },
      { name: "export_pdf", type: "boolean", required: false, description: "Return the finished PDF (default true). Set false for analysis only." },
      { name: "template", type: "string", required: false, description: "modern, classic, creative, executive, minimal or ats." },
      { name: "color", type: "string", required: false, description: "PDF accent color, e.g. #2563eb." },
      { name: "file", type: "object", required: false, description: "Native ChatGPT attachment with download_url and file_id." },
      { name: "file_url", type: "string", required: false, description: "Actual client-provided HTTPS download URL; never a sandbox path." },
      { name: "resume_text", type: "string", required: false, description: "Plain-text or Markdown resume content; best for an AI chat." },
      { name: "file_base64", type: "string", required: false, description: "Actual base64 bytes when the client can supply them; prefer file or extracted text." },
      { name: "filename", type: "string", required: false, description: "Original filename when providing Base64 content." },
      { name: "job_title", type: "string", required: false, description: "Target position title." },
      { name: "company_name", type: "string", required: false, description: "Target hiring company." },
      { name: "language", type: "string", required: false, description: "Language hint (e.g. 'en' or 'ar')." },
      { name: "generate_cover_letter", type: "boolean", required: false, description: "Generate a targeted cover letter (default: false)." },
      { name: "include_interview_questions", type: "boolean", required: false, description: "Generate interview prep Q&A (default: false)." },
      { name: "include_roadmap", type: "boolean", required: false, description: "Generate a preparation roadmap (default: false)." },
    ],
  },
  {
    name: "civify_score_ats",
    category: "resume_ai",
    categoryLabel: "Resume AI",
    description: "Calculate an ATS compatibility score (0–100) and identify missing keywords, formatting errors, and structure gaps.",
    authRequired: true,
    samplePrompt: "Calculate the ATS compatibility score for my attached resume.",
    parameters: [
      { name: "file", type: "object", required: false, description: "Native ChatGPT attachment with download_url and file_id." },
      { name: "file_url", type: "string", required: false, description: "Actual client-provided HTTPS download URL; never a sandbox path." },
      { name: "resume_text", type: "string", required: false, description: "Plain-text or Markdown resume content; best for an AI chat." },
      { name: "file_base64", type: "string", required: false, description: "Actual base64 bytes when the client can supply them; prefer file or extracted text." },
      { name: "filename", type: "string", required: false, description: "Original filename when providing Base64 content." },
      { name: "resume_data", type: "object", required: false, description: "Structured JSON resume data." },
    ],
  },
  {
    name: "civify_mask_pii",
    category: "resume_ai",
    categoryLabel: "Resume AI",
    description: "Sanitize personal identifiable information (name, phone, email, address, photo) to generate an anonymized PDF for blind applications.",
    authRequired: true,
    samplePrompt: "Redact personal contact details from my attached CV and return a link to the anonymized PDF.",
    parameters: [
      { name: "file", type: "object", required: false, description: "Native ChatGPT attachment with download_url and file_id." },
      { name: "file_url", type: "string", required: false, description: "Real HTTPS attachment URL." },
      { name: "resume_text", type: "string", required: false, description: "Complete text read from the attached resume." },
      { name: "file_base64", type: "string", required: false, description: "Base64-encoded resume file for a remote MCP server." },
    ],
  },
  {
    name: "civify_generate_pdf",
    category: "resume_ai",
    categoryLabel: "Resume AI",
    description: "Render high-fidelity PDF from structured resume data using professional Civify templates (Modern, Classic, Minimal).",
    authRequired: false,
    samplePrompt: "Export my tailored resume data to a modern PDF named tailored_resume.pdf.",
    parameters: [
      { name: "resume_data", type: "object", required: true, description: "Structured JSON resume data." },
      { name: "template", type: "string", required: false, description: "Template style: 'modern', 'classic', 'minimal' (default: modern)." },
      { name: "color", type: "string", required: false, description: "Primary accent color hex (default: '#000000')." },
      { name: "filename", type: "string", required: false, description: "Filename for the exported PDF." },
    ],
  },

  // ─── Application Tracking (Kanban) ────────────────────────────────────
  {
    name: "civify_track_application",
    category: "kanban",
    categoryLabel: "Job Tracker",
    description: "Record a job application directly onto the candidate's Civify Kanban board (Track dates, company, role, stage, and notes).",
    authRequired: true,
    samplePrompt: "Track an application to OpenAI for Senior AI Engineer, status INTERVIEW, note: 'Round 1 technical on Thursday'.",
    parameters: [
      { name: "company_name", type: "string", required: true, description: "Name of the target employer." },
      { name: "job_title", type: "string", required: true, description: "Job title / role." },
      { name: "job_url", type: "string", required: false, description: "Link to the job posting." },
      { name: "status", type: "string", required: false, description: "'EVALUATED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED' (default: APPLIED)." },
      { name: "notes", type: "string", required: false, description: "Notes, recruiter contacts, or interview dates." },
    ],
  },
  {
    name: "civify_list_applications",
    category: "kanban",
    categoryLabel: "Job Tracker",
    description: "List all tracked job applications from the candidate's Civify Kanban board with status, notes, and timeline.",
    authRequired: true,
    samplePrompt: "Show all my active job applications and interview stages from my Civify tracker.",
    parameters: [
    ],
  },
];

export function McpDocumentation() {
  const t = useTranslations("mcp-docs");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTools =
    activeCategory === "all"
      ? MCP_TOOLS
      : MCP_TOOLS.filter((t) => t.category === activeCategory);

  const claudeRemoteConfig = "https://mcp.civify.cv/mcp";

  const claudeLocalConfig = `{
  "mcpServers": {
    "civify": {
      "command": "npx",
      "args": ["-y", "@civify/mcp-server"]
    }
  }
}`;

  const cursorConfig = `{
  "mcpServers": {
    "civify": {
      "command": "npx",
      "args": ["-y", "@civify/mcp-server"]
    }
  }
}`;

  return (
    <div className="space-y-12">
      {/* ─── Highlights / Badges ─── */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <a
          href="https://smithery.ai/servers/technolabs/civify"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center hover:opacity-85 transition-opacity"
          title="Civify on Smithery"
        >
          <Badge variant="outline" className="px-3 py-1 text-xs gap-1 border-primary/40 hover:bg-muted font-medium text-foreground">
            Smithery Listing <ExternalLink className="h-3 w-3 text-primary" />
          </Badge>
        </a>
        <Badge variant="secondary" className="px-3 py-1 font-mono text-xs">
          MCP v1.5.0
        </Badge>
        <Badge variant="outline" className="px-3 py-1 text-xs gap-1 border-primary/40 text-primary">
          <Zap className="h-3 w-3" /> 13 Hosted Tools
        </Badge>
        <Badge variant="outline" className="px-3 py-1 text-xs gap-1">
          <Server className="h-3 w-3" /> Remote HTTP & Local npm
        </Badge>
        <Badge variant="outline" className="px-3 py-1 text-xs gap-1">
          <Shield className="h-3 w-3" /> Browser OAuth
        </Badge>
      </div>

      {/* ─── Client Setup Tabs ─── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>Connect AI Clients</CardTitle>
          </div>
          <CardDescription>
            Connect ChatGPT or Claude with hosted OAuth, or use local stdio with a compatible client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="claude-remote" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="claude-remote">ChatGPT / Claude</TabsTrigger>
              <TabsTrigger value="claude-local">Claude (Local npx)</TabsTrigger>
              <TabsTrigger value="cursor">Cursor IDE</TabsTrigger>
              <TabsTrigger value="cli">OpenCode / CLI</TabsTrigger>
            </TabsList>

            {/* Claude Remote (Streamable HTTP) */}
            <TabsContent value="claude-remote" className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 border text-sm space-y-2">
                <p className="font-semibold flex items-center gap-1.5 text-foreground">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  Zero Installation Required
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Connects directly to Civify&apos;s hosted MCP server at{" "}
                  <code className="bg-background px-1.5 py-0.5 rounded border">
                    https://mcp.civify.cv/mcp
                  </code>
                  . Uses Streamable HTTP transport (new MCP standard). No Node.js or local package installation needed.
                </p>
              </div>

              <div className="relative">
                <div className="text-xs text-muted-foreground mb-1">
                  {t("workflow.connect")}
                </div>
                <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 text-xs font-mono overflow-x-auto">
                  {claudeRemoteConfig}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-7 right-2 h-7 w-7 p-0 text-zinc-400 hover:text-zinc-100"
                  onClick={() => handleCopy(claudeRemoteConfig, "claude-remote")}
                >
                  {copiedId === "claude-remote" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </TabsContent>

            {/* Claude Local */}
            <TabsContent value="claude-local" className="space-y-4">
              <div className="relative">
                <div className="text-xs text-muted-foreground mb-1">
                  Add to <code className="text-foreground font-mono">claude_desktop_config.json</code>:
                </div>
                <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 text-xs font-mono overflow-x-auto">
                  {claudeLocalConfig}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-7 right-2 h-7 w-7 p-0 text-zinc-400 hover:text-zinc-100"
                  onClick={() => handleCopy(claudeLocalConfig, "claude-local")}
                >
                  {copiedId === "claude-local" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </TabsContent>

            {/* Cursor */}
            <TabsContent value="cursor" className="space-y-4">
              <div className="relative">
                <div className="text-xs text-muted-foreground mb-1">
                  Add to your project's <code className="text-foreground font-mono">.cursor/mcp.json</code>:
                </div>
                <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 text-xs font-mono overflow-x-auto">
                  {cursorConfig}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-7 right-2 h-7 w-7 p-0 text-zinc-400 hover:text-zinc-100"
                  onClick={() => handleCopy(cursorConfig, "cursor")}
                >
                  {copiedId === "cursor" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </TabsContent>

            {/* OpenCode / CLI */}
            <TabsContent value="cli" className="space-y-4">
              <div className="relative">
                <div className="text-xs text-muted-foreground mb-1">Run directly in terminal:</div>
                <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 text-xs font-mono overflow-x-auto">
                  npx -y @civify/mcp-server
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-7 right-2 h-7 w-7 p-0 text-zinc-400 hover:text-zinc-100"
                  onClick={() => handleCopy("npx -y @civify/mcp-server", "cli-cmd")}
                >
                  {copiedId === "cli-cmd" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader>
          <CardTitle>{t("workflow.title")}</CardTitle>
          <CardDescription>{t("workflow.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal space-y-3 ps-5">
            <li>{t("workflow.auth")}</li>
            <li>{t("workflow.attach")}</li>
            <li>{t("workflow.task")}</li>
            <li>{t("workflow.download")}</li>
          </ol>
          <p className="text-muted-foreground">{t("workflow.fallback")}</p>
          <p className="text-muted-foreground">{t("workflow.local")}</p>
        </CardContent>
      </Card>

      {/* ─── Tool Reference Section ─── */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Terminal className="h-6 w-6 text-primary" />
              Tool Reference ({MCP_TOOLS.length} Tools)
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              All tools available to the AI agent during conversation.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All (13)" },
              { id: "auth", label: "Start & Account (2)" },
              { id: "pay_per_cv", label: "Pay-Per-CV (3)" },
              { id: "resume_ai", label: "Resume AI (6)" },
              { id: "kanban", label: "Job Tracker (2)" },
            ].map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tools List Grid */}
        <div className="space-y-4">
          {filteredTools.map((tool) => (
            <Card key={tool.name} className="border-border/60 hover:border-border transition-colors">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <code className="text-base font-bold font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded">
                      {tool.name}
                    </code>
                    <Badge variant="secondary" className="text-xs">
                      {tool.categoryLabel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tool.isPublic ? (
                      <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/40">
                        Public (No Auth)
                      </Badge>
                    ) : tool.authRequired ? (
                      <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/40">
                        Auth Required
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Session Setup
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-sm text-foreground/90 mt-2">
                  {tool.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                {/* Sample Prompt */}
                <div className="rounded-md bg-muted/60 p-2.5 border flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Example Agent Prompt: </span>
                    <span className="text-muted-foreground italic">&ldquo;{tool.samplePrompt}&rdquo;</span>
                  </div>
                </div>

                {/* Parameters Table */}
                {tool.parameters.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                        <tr>
                          <th className="py-2 px-3">Parameter</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3">Required</th>
                          <th className="py-2 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {tool.parameters.map((p) => (
                          <tr key={p.name} className="hover:bg-muted/20">
                            <td className="py-2 px-3 font-mono font-semibold text-foreground">{p.name}</td>
                            <td className="py-2 px-3 text-muted-foreground font-mono">{p.type}</td>
                            <td className="py-2 px-3">
                              {p.required ? (
                                <span className="text-red-500 font-semibold">Yes</span>
                              ) : (
                                <span className="text-muted-foreground">No</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-muted-foreground">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted-foreground italic">No input parameters required.</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── Regional & Geo Capabilities ─── */}
      <Card className="border-border/60 shadow-sm bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            <CardTitle>{t("regional.title")}</CardTitle>
          </div>
          <CardDescription>
            Engineered natively for both Middle East & North Africa (MENA) and Global markets.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-background/80 rounded-lg p-4 border space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Globe className="h-3.5 w-3.5" />
              </span>
              {t("regional.bilingualTitle")}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("regional.bilingualDesc")}
            </p>
          </div>

          <div className="bg-background/80 rounded-lg p-4 border space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
                <DollarSign className="h-3.5 w-3.5" />
              </span>
              {t("regional.pricingTitle")}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("regional.pricingDesc")}
            </p>
          </div>

          <div className="bg-background/80 rounded-lg p-4 border space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
                <Shield className="h-3.5 w-3.5" />
              </span>
              {t("regional.privacyTitle")}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("regional.privacyDesc")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ─── Compatible AI Clients Grid ─── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>{t("compatibility.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { name: "ChatGPT", tag: "Remote HTTP / OAuth" },
              { name: t("compatibility.claude"), tag: "Desktop / Remote HTTP" },
              { name: t("compatibility.cursor"), tag: "IDE stdio / npx" },
              { name: t("compatibility.windsurf"), tag: "Next-Gen IDE" },
              { name: t("compatibility.opencode"), tag: "Terminal Agent" },
              { name: t("compatibility.gemini"), tag: "CLI / LibreChat" },
            ].map((client) => (
              <div
                key={client.name}
                className="rounded-lg border bg-muted/40 p-3 text-center space-y-1.5"
              >
                <div className="font-semibold text-xs text-foreground flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {client.name}
                </div>
                <div className="text-[10px] text-muted-foreground">{client.tag}</div>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  {t("compatibility.statusVerified")}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Semantic FAQ Section (High-Value for SEO & GEO) ─── */}
      <div className="space-y-6" id="faq" itemScope itemType="https://schema.org/FAQPage">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center md:justify-start gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            {t("faq.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("faq.subtitle")}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {(["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const).map((qKey) => (
            <AccordionItem
              key={qKey}
              value={qKey}
              className="border border-border/60 rounded-lg px-4 data-[state=open]:bg-muted/30"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4 font-semibold text-foreground text-sm">
                <span itemProp="name">{t(`faq.items.${qKey}.question`)}</span>
              </AccordionTrigger>
              <AccordionContent
                className="text-xs text-muted-foreground leading-relaxed pb-4 pt-1"
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <div itemProp="text">{t(`faq.items.${qKey}.answer`)}</div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* ─── Registry Badges & Links Footer ─── */}
      <Card className="border-border/60 bg-muted/30">
        <CardContent className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span>Explore MCP directories: Smithery, Glama, and PulseMCP.</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://smithery.ai/servers/technolabs/civify"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4 font-medium"
            >
              Smithery <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://glama.ai/mcp/servers"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
            >
              Glama <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://pulsemcp.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
            >
              PulseMCP <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
