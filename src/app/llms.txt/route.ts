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
- [Privacy Policy](${baseUrl}/en/policy): Data handling and privacy practices
- [Terms of Service](${baseUrl}/en/terms): Usage terms and conditions
- [Contact Support](${baseUrl}/en/contact): Support and inquiries

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
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
