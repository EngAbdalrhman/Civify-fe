import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv"
  ).replace(/\/$/, "");

  const content = `# Civify

> AI-powered resume builder and CV tailoring platform with ATS optimization, match scoring, and full Arabic support.

Civify helps job seekers create, tailor, and optimize resumes for specific job descriptions using AI. It provides ATS (Applicant Tracking System) compatibility scoring, keyword analysis, and professional PDF export. Supports English and Arabic with RTL layout.

Key terms: AI resume builder, CV tailoring, ATS score checker, resume match score, Arabic resume builder, resume optimization, job description analyzer, ATS-friendly CV, resume keyword optimizer.

## Key Features
- AI Resume Builder: Generate professional resumes from scratch using AI
- CV Tailoring: Upload your CV + job description to get an optimized, tailored version
- ATS Score Checker: Real-time Applicant Tracking System compatibility scoring against job descriptions
- Resume Match Score: Percentage-based match analysis with actionable improvement suggestions
- Arabic Support: Full RTL layout with Arabic OCR and AI-powered content generation in Arabic
- Professional Templates: ATS-optimized, recruiter-approved resume templates
- Chrome Extension: Tailor your CV directly from LinkedIn job listings
- PDF Export: High-quality, print-ready resume downloads
- Privacy-First: Enterprise-grade encryption, GDPR-compliant data handling
- Resume Builder: Drag-and-drop section editor with real-time preview

## Pricing
- Free Plan: Basic resume building with limited AI generations
- Pro Plan: Unlimited AI tailoring, advanced ATS scoring, priority support
- [Pricing Details](${baseUrl}/en/plans): Full comparison of plans and features

## Docs
- [API Documentation](${baseUrl}/en/api-docs): REST API for resume parsing and generation
- [Privacy Policy](${baseUrl}/en/policy): Data handling and privacy practices
- [Terms of Service](${baseUrl}/en/terms): Usage terms and conditions
- [Contact Support](${baseUrl}/en/contact): Support and inquiries

## Pages
- [Home](${baseUrl}/en): Main landing page with features overview
- [Pricing Plans](${baseUrl}/en/plans): Subscription plans and pricing
- [Chrome Extension](${baseUrl}/en/extension): Browser extension for LinkedIn integration
- [Cancellation Policy](${baseUrl}/en/policy/cancellation): Subscription cancellation details

## Optional
- [Arabic Home](${baseUrl}/ar): Arabic version of the platform (full RTL support)
- [Arabic Pricing](${baseUrl}/ar/plans): Arabic pricing page
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

