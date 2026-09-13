"use client";

import { useState } from "react";
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
  // ─── Authentication & Profile ──────────────────────────────────────────
  {
    name: "civify_set_api_key",
    category: "auth",
    categoryLabel: "Auth & Account",
    description: "Set or switch the active Civify API key (starts with 'cv-fy-') for this agent session. Validates the key with the server immediately.",
    authRequired: false,
    samplePrompt: "Use my Civify API key cv-fy-9a8b7c6d... for this session.",
    parameters: [
      { name: "api_key", type: "string", required: true, description: "Civify API key starting with 'cv-fy-'." },
    ],
  },
  {
    name: "civify_login",
    category: "auth",
    categoryLabel: "Auth & Account",
    description: "Sign in to Civify using email or username and password. Automatically provisions an API key for the session (with 2FA support).",
    authRequired: false,
    samplePrompt: "Log in to my Civify account with email candidate@example.com and password mySecurePassword.",
    parameters: [
      { name: "identifier", type: "string", required: true, description: "User's email address or username." },
      { name: "password", type: "string", required: true, description: "Civify account password." },
    ],
  },
  {
    name: "civify_verify_2fa",
    category: "auth",
    categoryLabel: "Auth & Account",
    description: "Complete two-factor authentication (2FA) by submitting the 6-digit OTP code sent to the user's email after login.",
    authRequired: false,
    samplePrompt: "Here is the 2FA verification code sent to my email: 849201.",
    parameters: [
      { name: "code", type: "string", required: true, description: "6-digit OTP code received via email." },
      { name: "username", type: "string", required: false, description: "Username or email (optional if login was called in this session)." },
    ],
  },
  {
    name: "civify_register",
    category: "auth",
    categoryLabel: "Auth & Account",
    description: "Register a brand-new Civify account and automatically provision a session API key upon successful creation.",
    authRequired: false,
    samplePrompt: "Create a new Civify account for me with email me@example.com, username devcandidate, and password myPassword123.",
    parameters: [
      { name: "email", type: "string", required: true, description: "Valid email address." },
      { name: "password", type: "string", required: true, description: "Account password (min 8 characters)." },
      { name: "username", type: "string", required: true, description: "Unique username." },
      { name: "referral_code", type: "string", required: false, description: "Optional referral / promo code." },
    ],
  },
  {
    name: "civify_logout",
    category: "auth",
    categoryLabel: "Auth & Account",
    description: "Clear active credentials and reset all authentication state for this agent session.",
    authRequired: false,
    samplePrompt: "Log me out of my Civify session.",
    parameters: [],
  },
  {
    name: "civify_get_account",
    category: "auth",
    categoryLabel: "Auth & Account",
    description: "Retrieve candidate profile, active plan, remaining AI tokens, and purchased CV pass credits.",
    authRequired: true,
    samplePrompt: "Check my Civify account profile and see how many AI tokens and credits I have left.",
    parameters: [
      { name: "api_key", type: "string", required: false, description: "Optional API key override." },
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
      { name: "package_type", type: "string", required: false, description: "'SINGLE' or 'THREE_PACK' (default: SINGLE)." },
      { name: "payment_method", type: "string", required: false, description: "'CARD' or 'WALLET' (default: CARD)." },
      { name: "resume_id", type: "string", required: false, description: "Target CV ID to bind this entitlement to." },
      { name: "api_key", type: "string", required: false, description: "Optional API key override." },
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
      { name: "api_key", type: "string", required: false, description: "Optional API key override." },
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
    samplePrompt: "Parse the CV at /Users/me/Documents/resume.pdf into structured JSON format.",
    parameters: [
      { name: "file_path", type: "string", required: false, description: "Absolute local path to the CV file." },
      { name: "file_base64", type: "string", required: false, description: "Base64-encoded CV file content." },
      { name: "filename", type: "string", required: false, description: "Original filename with extension (e.g. resume.pdf)." },
      { name: "language", type: "string", required: false, description: "Language hint (e.g. 'en', 'ar')." },
      { name: "api_key", type: "string", required: false, description: "Optional API key override." },
    ],
  },
  {
    name: "civify_tailor_cv",
    category: "resume_ai",
    categoryLabel: "Resume AI",
    description: "Tailor CV bullet points, keywords, and summary against a target job description. Optionally generates cover letter and interview Q&A.",
    authRequired: true,
    samplePrompt: "Tailor my resume /Users/me/cv.pdf for this job description: 'Seeking Senior Fullstack Engineer with Next.js and Spring Boot...'. Generate a cover letter too.",
    parameters: [
      { name: "job_description", type: "string", required: true, description: "Target job description text or scraped requirements." },
      { name: "file_path", type: "string", required: false, description: "Local path to candidate CV file." },
      { name: "job_title", type: "string", required: false, description: "Target position title." },
      { name: "company_name", type: "string", required: false, description: "Target hiring company." },
      { name: "generate_cover_letter", type: "boolean", required: false, description: "Generate a targeted cover letter (default: false)." },
      { name: "include_interview_questions", type: "boolean", required: false, description: "Generate interview prep Q&A (default: false)." },
      { name: "api_key", type: "string", required: false, description: "Optional API key override." },
    ],
  },
  {
    name: "civify_score_ats",
    category: "resume_ai",
    categoryLabel: "Resume AI",
    description: "Calculate an ATS compatibility score (0–100) and identify missing keywords, formatting errors, and structure gaps.",
    authRequired: true,
    samplePrompt: "Calculate the ATS compatibility score for my resume in /docs/resume.pdf.",
    parameters: [
      { name: "file_path", type: "string", required: false, description: "Local path to CV file." },
      { name: "resume_data", type: "object", required: false, description: "Structured JSON resume data." },
      { name: "api_key", type: "string", required: false, description: "Optional API key override." },
    ],
  },
  {
    name: "civify_mask_pii",
    category: "resume_ai",
    categoryLabel: "Resume AI",
    description: "Sanitize personal identifiable information (name, phone, email, address, photo) to generate an anonymized PDF for blind applications.",
    authRequired: true,
    samplePrompt: "Redact all personal contact details from /Users/me/cv.pdf and save the anonymized PDF.",
    parameters: [
      { name: "file_path", type: "string", required: false, description: "Local path to CV file." },
      { name: "output_path", type: "string", required: false, description: "Destination path for masked PDF." },
      { name: "api_key", type: "string", required: false, description: "Optional API key override." },
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
      { name: "output_path", type: "string", required: false, description: "Output filepath for generated PDF." },
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
      { name: "api_key", type: "string", required: false, description: "Optional API key override." },
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
      { name: "api_key", type: "string", required: false, description: "Optional API key override." },
    ],
  },
];

export function McpDocumentation() {
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

  const claudeRemoteConfig = `{
  "mcpServers": {
    "civify": {
      "url": "https://mcp.civify.cv/sse"
    }
  }
}`;

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
        <Badge variant="secondary" className="px-3 py-1 font-mono text-xs">
          MCP v1.1.0 Official
        </Badge>
        <Badge variant="outline" className="px-3 py-1 text-xs gap-1 border-primary/40 text-primary">
          <Zap className="h-3 w-3" /> 17 Automated Tools
        </Badge>
        <Badge variant="outline" className="px-3 py-1 text-xs gap-1">
          <Server className="h-3 w-3" /> Remote SSE & Local npm
        </Badge>
        <Badge variant="outline" className="px-3 py-1 text-xs gap-1">
          <Shield className="h-3 w-3" /> Dynamic Multi-User Auth
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
            Configure Claude Desktop, Cursor, OpenCode, Windsurf, or any MCP client in seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="claude-remote" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="claude-remote">Claude (Remote SSE)</TabsTrigger>
              <TabsTrigger value="claude-local">Claude (Local npx)</TabsTrigger>
              <TabsTrigger value="cursor">Cursor IDE</TabsTrigger>
              <TabsTrigger value="cli">OpenCode / CLI</TabsTrigger>
            </TabsList>

            {/* Claude Remote SSE */}
            <TabsContent value="claude-remote" className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 border text-sm space-y-2">
                <p className="font-semibold flex items-center gap-1.5 text-foreground">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  Zero Installation Required
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Connects directly to Civify's hosted remote SSE server at{" "}
                  <code className="bg-background px-1.5 py-0.5 rounded border">
                    https://mcp.civify.cv/sse
                  </code>
                  . No Node.js or local package installation needed.
                </p>
              </div>

              <div className="relative">
                <div className="text-xs text-muted-foreground mb-1">
                  Add to <code className="text-foreground font-mono">claude_desktop_config.json</code>:
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

      {/* ─── Dynamic Authentication Banner ─── */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Dynamic Multi-User Authentication</CardTitle>
          </div>
          <CardDescription>
            No static or hardcoded API key required. Users can sign in or register straight from chat!
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-background rounded-lg p-4 border space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-mono">1</span>
              Interactive Sign-In
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Call <code className="font-mono bg-muted px-1 py-0.5 rounded">civify_login</code> with your email & password. If 2FA is active, verify via <code className="font-mono bg-muted px-1 py-0.5 rounded">civify_verify_2fa</code> using the email OTP code.
            </p>
          </div>

          <div className="bg-background rounded-lg p-4 border space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-mono">2</span>
              In-Chat Registration
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              New candidates can invoke <code className="font-mono bg-muted px-1 py-0.5 rounded">civify_register</code> to create an account and immediately receive session access tokens.
            </p>
          </div>

          <div className="bg-background rounded-lg p-4 border space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-mono">3</span>
              Developer Key
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Developers who already have a key (<code className="font-mono text-xs">cv-fy-...</code>) can provide it anytime using <code className="font-mono bg-muted px-1 py-0.5 rounded">civify_set_api_key</code>.
            </p>
          </div>
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
              { id: "all", label: "All (17)" },
              { id: "auth", label: "Auth (6)" },
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

      {/* ─── Registry Badges & Links Footer ─── */}
      <Card className="border-border/60 bg-muted/30">
        <CardContent className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span>Discoverable on official registries: Smithery, Glama, and PulseMCP.</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://smithery.ai"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
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
