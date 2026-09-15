import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv"
  ).replace(/\/$/, "");

  const content = `# Civify

> AI-powered resume builder and CV tailoring platform with ATS score insights, keyword matching, and Arabic + RTL support.

Civify helps job seekers upload a CV, review parsed data, tailor content to a job description, and export with ATS scoring feedback. Supports English and Arabic with RTL layouts and Arabic OCR for scanned uploads.

Key terms: AI resume builder, CV tailoring, ATS score checker, resume match score, Arabic resume builder, resume optimization, job description analyzer, ATS-friendly CV, resume keyword matching.

## Key Features
- CV Upload & Review: Upload a resume, review parsed sections, then tailor
- CV Tailoring: Optimize your CV against a pasted job description
- ATS Score Insights: Before/after ATS score with keyword and skills match feedback
- Job Matches: Structured job-description analysis and fit insights (separate workflow)
- Arabic Support: Arabic UI, RTL layouts, Arabic OCR, and bilingual resume workflows
- Resume Templates: Five ATS-friendly styles (Modern, Classic, Creative, Executive, Minimal)
- Chrome Extension: Tailor faster from LinkedIn job pages
- PDF/DOCX Export: Download tailored resumes from upload flow or builder
- Resume Masking: Hide personal info in preview/export when sharing

## Pricing
- Free Plan: Basic resume building with limited AI generations
- Pro Plan: Expanded AI tailoring, exports, and premium features
- [Pricing Details](${baseUrl}/en/plans): Full comparison of plans and features

## Docs
- [API Documentation](${baseUrl}/en/api-docs): REST API for resume parsing and generation
- [MCP Server Documentation](${baseUrl}/en/mcp-docs): Official Model Context Protocol integration for AI agents (Claude, Cursor, OpenCode)
- [Full LLM Specification](${baseUrl}/llms-full.txt): Comprehensive tool schemas, parameters, and full agent documentation
- [Privacy Policy](${baseUrl}/en/policy): Data handling and privacy practices
- [Terms of Service](${baseUrl}/en/terms): Usage terms and conditions
- [Contact Support](${baseUrl}/en/contact): Support and inquiries

## Model Context Protocol (MCP) Integration for AI Agents
Civify provides a production-grade, 17-tool MCP server for autonomous coding and career agents:
- Streamable HTTP Endpoint (Recommended): https://mcp.civify.cv/mcp
- Legacy SSE Endpoint: https://mcp.civify.cv/sse
- Local stdio / npm Package: \`npx -y @civify/mcp-server\`
- Static Server Card (SEP-1649): https://mcp.civify.cv/.well-known/mcp/server-card.json
- Registry Listings: Smithery, Glama, PulseMCP
- Chat Agent File Convention: For remote AI agents (ChatGPT, Claude), pass resume content as plain text/markdown via \`resume_text\` or Base64 document bytes via \`file_base64\`. Server file paths are reserved for local CLI usage.

### Quickstart Configuration
For Claude Desktop (\`claude_desktop_config.json\`):
\`\`\`json
{
  "mcpServers": {
    "civify": {
      "url": "https://mcp.civify.cv/mcp"
    }
  }
}
\`\`\`

For Cursor (\`.cursor/mcp.json\`):
\`\`\`json
{
  "mcpServers": {
    "civify": {
      "command": "npx",
      "args": ["-y", "@civify/mcp-server"]
    }
  }
}
\`\`\`

### Available Tools (17 Tools)
1. Auth & Identity:
   - \`civify_set_api_key\`: Set or switch developer API key (\`cv-fy-...\`)
   - \`civify_login\`: Interactive sign-in with email/password and automatic token exchange
   - \`civify_verify_2fa\`: Submit 6-digit email OTP for two-factor verification
   - \`civify_register\`: Create a new user account directly from chat
   - \`civify_get_account\`: Check user profile, plan tier, remaining AI tokens, and credits
   - \`civify_logout\`: Clear active credentials and reset session state
2. Monetization & Pay-Per-CV:
   - \`civify_get_pay_per_cv_pricing\`: Get public localized pricing (USD and EGP regional rates)
   - \`civify_purchase_cv_pass\`: Initiate checkout for single CV pass or 3-pack (Card or Wallet)
   - \`civify_check_cv_entitlement\`: Verify if a CV has an active 30-day unwatermarked pass
3. Resume AI:
   - \`civify_scrape_job\`: Scrape structured requirements from job URLs (LinkedIn, Greenhouse, Lever, etc.)
   - \`civify_parse_cv\`: Parse PDF, DOCX, or scanned image into structured JSON schema (with Arabic OCR)
   - \`civify_tailor_cv\`: Tailor resume bullet points against a job description + cover letter
   - \`civify_score_ats\`: Calculate 0–100 ATS score, section audit, and keyword gap analysis
   - \`civify_mask_pii\`: Redact personal contact information to create blind screening PDF
   - \`civify_generate_pdf\`: Render styled PDF using Civify templates (Modern, Classic, Minimal)
4. Job Application Tracker (Kanban):
   - \`civify_track_application\`: Record application to user's Civify Kanban board
   - \`civify_list_applications\`: List all tracked job applications with statuses and notes

### Regional & Multi-Currency Features
- Natively Bilingual: Full support for English and Arabic CVs, Arabic OCR, and RTL layouts
- Regional GeoIP Pricing: Automatic currency localization (USD global, EGP for Egypt/MENA via Paymob and Fawaterak)

## Pages
- [Home](${baseUrl}/en): Main landing page with features overview
- [Pricing Plans](${baseUrl}/en/plans): Subscription plans and pricing
- [Chrome Extension](${baseUrl}/en/extension): Browser extension for LinkedIn job pages
- [Blog](${baseUrl}/en/blog): Career resources, resume writing guides, and job search tips
- [Cancellation Policy](${baseUrl}/en/policy/cancellation): Subscription cancellation details

## Optional
- [Arabic Home](${baseUrl}/ar): Arabic version of the platform (RTL support)
- [Arabic Pricing](${baseUrl}/ar/plans): Arabic pricing page
- [Arabic Blog](${baseUrl}/ar/blog): Arabic blog and career resources
- [Arabic MCP Documentation](${baseUrl}/ar/mcp-docs): Arabic MCP documentation
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
