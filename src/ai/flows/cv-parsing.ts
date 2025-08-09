"use server";

/**
 * @fileOverview Enhanced CV parsing with structured field extraction
 *
 * - parseCv - A function that parses CV text into structured fields
 * - ParseCvInput - The input type for the parseCv function
 * - ParseCvOutput - The return type for the parseCv function
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const ParseCvInputSchema = z.object({
  cvText: z.string().describe("The raw text extracted from the CV"),
});

export type ParseCvInput = z.infer<typeof ParseCvInputSchema>;

const ParseCvOutputSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().describe("Full name of the candidate"),
    email: z.string().describe("Email address"),
    phone: z.string().describe("Phone number"),
    address: z.string().optional().describe("Physical address"),
    linkedin: z.string().optional().describe("LinkedIn profile URL"),
    github: z.string().optional().describe("GitHub profile URL"),
    portfolio: z.string().optional().describe("Portfolio website URL"),
  }),
  professionalSummary: z
    .string()
    .describe("Professional summary or objective statement"),
  workExperience: z
    .array(
      z.object({
        jobTitle: z.string().describe("Job title or position"),
        company: z.string().describe("Company name"),
        location: z.string().optional().describe("Job location"),
        startDate: z.string().describe("Start date (format: Month Year)"),
        endDate: z
          .string()
          .describe('End date (format: Month Year or "Present")'),
        description: z.string().describe("Job description and achievements"),
        keyAchievements: z
          .array(z.string())
          .describe("Specific achievements and accomplishments"),
      })
    )
    .describe("Work experience entries"),
  education: z
    .array(
      z.object({
        degree: z.string().describe("Degree title"),
        institution: z.string().describe("Educational institution"),
        location: z.string().optional().describe("Institution location"),
        graduationDate: z
          .string()
          .describe("Graduation date (format: Month Year)"),
        gpa: z.string().optional().describe("GPA if mentioned"),
        honors: z
          .string()
          .optional()
          .describe("Academic honors or distinctions"),
      })
    )
    .describe("Education entries"),
  skills: z.object({
    technical: z.array(z.string()).describe("Technical skills"),
    soft: z.array(z.string()).describe("Soft skills"),
    languages: z
      .array(
        z.object({
          language: z.string(),
          proficiency: z.string(),
        })
      )
      .describe("Language skills with proficiency levels"),
    certifications: z.array(z.string()).describe("Professional certifications"),
  }),
  projects: z
    .array(
      z.object({
        name: z.string().describe("Project name"),
        description: z.string().describe("Project description"),
        technologies: z.array(z.string()).describe("Technologies used"),
        link: z.string().optional().describe("Project link if available"),
      })
    )
    .optional()
    .describe("Notable projects"),
  awards: z.array(z.string()).optional().describe("Awards and recognitions"),
  publications: z
    .array(z.string())
    .optional()
    .describe("Publications and papers"),
  volunteering: z
    .array(
      z.object({
        organization: z.string(),
        role: z.string(),
        description: z.string(),
        duration: z.string(),
      })
    )
    .optional()
    .describe("Volunteer experience"),
});

export type ParseCvOutput = z.infer<typeof ParseCvOutputSchema>;

export async function parseCv(input: ParseCvInput): Promise<ParseCvOutput> {
  console.log("CV Parsing Input - Text Length:", input.cvText?.length || 0);
  console.log(
    "CV Parsing Input - Text Preview:",
    input.cvText?.substring(0, 300)
  );

  const result = await parseCvFlow(input);

  console.log("CV Parsing Output:", JSON.stringify(result, null, 2));

  return result;
}

const prompt = ai.definePrompt({
  name: "parseCvPrompt",
  input: { schema: ParseCvInputSchema },
  output: { schema: ParseCvOutputSchema },
  prompt: `You are an expert CV parser. Analyze the provided CV text and extract all relevant information into a structured format. 

IMPORTANT INSTRUCTIONS:
- Extract information accurately from the CV text
- If a field is not present in the CV, use appropriate defaults (empty strings for required fields, empty arrays for arrays)
- For dates, standardize to "Month Year" format (e.g., "January 2020")
- For current positions, use "Present" as the end date
- Group skills appropriately into technical and soft skills
- Extract specific achievements and quantifiable results from job descriptions
- Maintain the original meaning and context while structuring the data
- Be comprehensive but accurate - don't invent information that's not in the CV

CV Text:
{{{cvText}}}`,
});

const parseCvFlow = ai.defineFlow(
  {
    name: "parseCvFlow",
    inputSchema: ParseCvInputSchema,
    outputSchema: ParseCvOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
