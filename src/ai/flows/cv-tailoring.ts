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

FORMATTING REQUIREMENTS:
- Use clean, professional HTML with inline CSS styling
- Create clear, well-organized sections with proper spacing
- Use consistent typography and professional color scheme
- Ensure the layout is ATS-friendly and print-ready
- Include proper section headers and visual hierarchy
- Make it visually appealing with subtle design elements

CONTENT REQUIREMENTS:
1. **Header Section**: Name, contact information, professional links
2. **Professional Summary**: Compelling 3-4 line summary tailored to the job
3. **Core Competencies**: Key skills relevant to the position (2-3 columns)
4. **Professional Experience**: Detailed work history with:
   - Job titles, companies, dates, locations
   - Bullet points highlighting achievements with metrics when possible
   - Emphasize experience most relevant to the target role
5. **Education**: Degrees, institutions, graduation dates, honors
6. **Technical Skills**: Organized by category if applicable
7. **Additional Sections** (if applicable): Projects, Certifications, Awards, Publications

TAILORING GUIDELINES:
- Reorder sections to prioritize most relevant information
- Emphasize keywords from the job description
- Quantify achievements wherever possible
- Remove or de-emphasize irrelevant experience
- Adjust the professional summary to match the role
- Highlight transferable skills for career changes
- Ensure the CV tells a compelling story for this specific role

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
