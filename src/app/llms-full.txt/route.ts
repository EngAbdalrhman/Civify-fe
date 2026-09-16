import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv"
  ).replace(/\/$/, "");

  const content = `# Civify — Full LLM & AI Agent Technical Specification

> Civify (https://civify.cv) is an AI-powered SaaS career platform providing resume building, ATS compatibility scoring, multilingual CV parsing, AI bullet tailoring, PII redaction, and Kanban job application tracking.

## Official Integrations
- **Model Context Protocol (MCP)**: \`npx -y @civify/mcp-server\`
- **Hosted Streamable HTTP (Recommended)**: \`https://mcp.civify.cv/mcp\`
- **Hosted Legacy SSE Stream**: \`https://mcp.civify.cv/sse\`
- **Static Server Card (SEP-1649)**: \`https://mcp.civify.cv/.well-known/mcp/server-card.json\`
- **Interactive Documentation**: \`${baseUrl}/en/mcp-docs\` (Arabic: \`${baseUrl}/ar/mcp-docs\`)
- **REST API Base**: \`https://civify.cv/apis\`
- **Developer API Key Management**: \`${baseUrl}/settings/api-keys\`

---

## Model Context Protocol (MCP) Server Specification

### Connection Transports
1. **Streamable HTTP (Recommended)**: Hosted at \`https://mcp.civify.cv/mcp\` (New MCP standard, used by Claude Desktop connectors).
2. **Remote Server-Sent Events (SSE)**: Hosted at \`https://mcp.civify.cv/sse\` (Legacy, for Smithery and older clients).
3. **Local Standard I/O (stdio)**: Run via Node.js with \`npx -y @civify/mcp-server\`.

### Dynamic Multi-User Authentication Lifecycle
No static key required at startup. Sessions authenticate dynamically:
1. **Developer Key**: User provides \`cv-fy-...\` via \`civify_set_api_key\` tool or \`CIVIFY_API_KEY\` environment variable.
2. **Interactive Sign-In**: Agent calls \`civify_login\` with email/username and password. If 2FA is active, agent calls \`civify_verify_2fa\` with 6-digit email OTP. The MCP server automatically exchanges the returned JWT for an API key.
3. **In-Chat Registration**: Agent calls \`civify_register\` to create an account directly in conversation.

---

## Complete Tool Directory (17 Tools)

### Category 1: Authentication & Identity
- **\`civify_set_api_key\`**: Set or switch the active Civify API key for this session.
  - Parameters: \`api_key\` (string, required, starts with 'cv-fy-')
- **\`civify_login\`**: Sign in with email or username and password.
  - Parameters: \`identifier\` (string, required), \`password\` (string, required)
- **\`civify_verify_2fa\`**: Complete two-factor authentication with 6-digit email OTP.
  - Parameters: \`code\` (string, required), \`username\` (string, optional)
- **\`civify_register\`**: Register a new candidate account.
  - Parameters: \`email\` (string, required), \`password\` (string, required), \`username\` (string, required), \`referral_code\` (string, optional)
- **\`civify_get_account\`**: Fetch profile, subscription plan tier, token balance, and CV credits.
  - Parameters: \`api_key\` (string, optional override)
- **\`civify_logout\`**: Clear active session credentials.
  - Parameters: none

### Category 2: Monetization & Pay-Per-CV
- **\`civify_get_pay_per_cv_pricing\`**: Get public localized single CV unlock pricing (USD global, EGP regional). Public tool, no auth required.
  - Parameters: none
- **\`civify_purchase_cv_pass\`**: Initiate checkout for single CV pass or 3-pack pass. Returns payment URL.
  - Parameters: \`package_type\` (SINGLE | THREE_PACK), \`payment_method\` (CARD | WALLET), \`resume_id\` (string, optional)
- **\`civify_check_cv_entitlement\`**: Check if a resume has an active 30-day unwatermarked pass.
  - Parameters: \`resume_id\` (string, required)

### Category 3: Resume AI & ATS Optimization
- **\`civify_scrape_job\`**: Scrape structured requirements from any public job URL (LinkedIn, Greenhouse, Lever, Ashby, Wuzzuf). Public tool, no auth required.
  - Parameters: \`url\` (string, required)
- **\`civify_parse_cv\`**: Parse PDF, DOCX, or scanned image resume into structured JSON (contact, experience, education, skills). Supports Arabic OCR.
  - Parameters: \`resume_text\` (string, plain text/markdown for chat agents), \`file_base64\` (string, Base64 document bytes), \`server_file_path\` (string, local server CLI path), \`filename\` (string, optional), \`language\` (string, default: auto)
- **\`civify_tailor_cv\`**: Tailor CV bullet points, skills, and summary against a target job description. Optionally generates cover letter and interview Q&A.
  - Parameters: \`job_description\` (string, required), \`resume_text\` (string, optional), \`file_base64\` (string, optional), \`server_file_path\` (string, optional), \`job_title\` (string, optional), \`company_name\` (string, optional), \`generate_cover_letter\` (boolean, default: false)
- **\`civify_score_ats\`**: Calculate 0–100 ATS compatibility score, section quality audit, and missing keywords analysis.
  - Parameters: \`resume_text\` (string, optional), \`file_base64\` (string, optional), \`server_file_path\` (string, optional), \`resume_data\` (object, optional)
- **\`civify_mask_pii\`**: Redact sensitive PII (name, phone, email, address, photo) and export an anonymized PDF for blind recruitment.
  - Parameters: \`file_base64\` (string, optional), \`server_file_path\` (string, optional), \`output_path\` (string, optional)
- **\`civify_generate_pdf\`**: Render high-fidelity PDF from structured resume data using Civify templates (Modern, Classic, Minimal).
  - Parameters: \`resume_data\` (object, required), \`template\` (string, default: modern), \`color\` (string, default: #000000), \`output_path\` (string, optional)

### Category 4: Job Application Tracking (Kanban)
- **\`civify_track_application\`**: Record an application in the candidate's Civify Kanban board.
  - Parameters: \`company_name\` (string, required), \`job_title\` (string, required), \`job_url\` (string, optional), \`status\` (EVALUATED | APPLIED | INTERVIEW | OFFER | REJECTED), \`notes\` (string, optional)
- **\`civify_list_applications\`**: List all tracked job applications with statuses, timelines, and notes.
  - Parameters: none

---

## Regional Capabilities & Multi-Currency Economics
- **Middle East & North Africa (MENA)**:
  - Arabic OCR for scanned PDF/image resumes.
  - Native RTL resume templates with Cairo and Tajawal typography.
  - Localized pricing in EGP (~150 EGP per CV unlock pass) with local card and mobile wallet support (Vodafone Cash, Orange Money, InstaPay) powered by Paymob and Fawaterak.
- **Global / US / Europe**:
  - Full support for English resumes and standard ATS formats.
  - USD base pricing ($2.99 per CV pass) with credit card checkout.
  - Blind recruitment PII redaction compliant with modern hiring fairness standards.
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
