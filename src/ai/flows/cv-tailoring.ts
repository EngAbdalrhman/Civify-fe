"use server";

/**
 * @fileOverview Enhanced CV tailoring AI agent with structured data support
 *
 * - tailorCv - A function that tailors a CV based on structured data and job description
 * - TailorCvInput - The input type for the tailorCv function
 * - TailorCvOutput - The return type for the tailorCv function
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import type { ParseCvOutput } from "./cv-parsing";

const TailorCvInputSchema = z.object({
  structuredCvData: z.any().describe("The structured CV data from parsing"),
  jobDescription: z
    .string()
    .describe("The job description for the role the user is applying for"),
});

export type TailorCvInput = z.infer<typeof TailorCvInputSchema>;

const TailorCvOutputSchema = z.object({
  tailoredCv: z
    .string()
    .describe(
      "The tailored CV content in clean, professional HTML format with proper styling"
    ),
});

export type TailorCvOutput = z.infer<typeof TailorCvOutputSchema>;

export async function tailorCv(input: TailorCvInput): Promise<TailorCvOutput> {
  return tailorCvFlow(input);
}

const prompt = ai.definePrompt({
  name: "tailorCvPrompt",
  input: { schema: TailorCvInputSchema },
  output: { schema: TailorCvOutputSchema },
  prompt: `You are an expert resume tailor and career advisor. You will be given structured CV data and a job description. Create a professionally tailored CV that highlights the most relevant skills, experience, and achievements for the specific job.

CRITICAL: You MUST use the provided structured CV data to create the tailored CV. Analyze both the structured CV data AND the job description to create optimal matching.

FORMATTING REQUIREMENTS:
- Use clean, semantic HTML with consistent structure
- Use proper heading hierarchy (h1 for name, h2 for sections, h3 for subsections)
- Use <p> tags for paragraphs and descriptions
- Use <ul> and <li> tags for lists and bullet points
- Use <strong> for emphasis and important information
- NO inline CSS or styling - keep it semantic for maximum ATS compatibility
- Ensure proper spacing with HTML structure, not CSS
- Make the layout clean and professional for both screen and text export

CONTENT REQUIREMENTS:
1. **Header Section (h1 + contact info)**: 
   - Full name from personalInfo.fullName
   - Email from personalInfo.email
   - Phone from personalInfo.phone
   - Include LinkedIn/GitHub if available

2. **Professional Summary (h2 + p)**:
   - Use professionalSummary as base
   - Tailor to match job requirements
   - 3-4 compelling sentences

3. **Core Competencies (h2 + ul)**:
   - Extract from skills.technical and skills.soft
   - Prioritize skills mentioned in job description
   - Present as clean bullet list

4. **Professional Experience (h2 + sections)**:
   - Use workExperience array data
   - Each role: h3 for title, company, dates
   - Use <ul><li> for achievements and responsibilities
   - Emphasize experience most relevant to target role
   - Include quantifiable achievements where available

5. **Education (h2 + sections)**:
   - Use education array data
   - Format: degree, institution, graduation date
   - Include honors if mentioned

6. **Additional Sections** (if data available):
   - Technical Skills (from skills.technical)
   - Certifications (from skills.certifications)
   - Projects (if projects data exists)
   - Awards (if awards data exists)

TAILORING STRATEGY:
- Analyze job description keywords and requirements
- Emphasize matching skills and experience from the structured data
- Reorder experience bullets to highlight most relevant achievements
- Use similar language and terminology from the job posting
- Quantify achievements where the original data includes metrics
- Remove or de-emphasize less relevant information
- Ensure the CV tells a compelling story for this specific role

STRUCTURED DATA USAGE:
- personalInfo: Use for contact details and basic information
- professionalSummary: Adapt and tailor to match job requirements
- workExperience: Highlight relevant roles and achievements
- education: Include all educational background
- skills: Emphasize skills that match job requirements
- projects/awards/certifications: Include if relevant to position

OUTPUT FORMAT:
Provide ONLY the HTML content for the CV. Start with the name as h1, then structured sections. Do not include any CSS, head tags, or html/body wrapper tags.

Structured CV Data:
{{{structuredCvData}}}

Job Description:
{{{jobDescription}}}`,
});

const tailorCvFlow = ai.defineFlow(
  {
    name: "tailorCvFlow",
    inputSchema: TailorCvInputSchema,
    outputSchema: TailorCvOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
