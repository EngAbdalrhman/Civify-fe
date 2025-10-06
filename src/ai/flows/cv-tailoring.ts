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

// Helper function to replace placeholders with actual data
function replacePlaceholders(cvHtml: string, structuredCvData: any): string {
  if (!structuredCvData) return cvHtml;

  let processedHtml = cvHtml;

  // Replace name placeholders
  if (structuredCvData.personalInfo?.fullName) {
    processedHtml = processedHtml.replace(
      /\[Full Name\]/g,
      structuredCvData.personalInfo.fullName
    );
    processedHtml = processedHtml.replace(
      /\[Name\]/g,
      structuredCvData.personalInfo.fullName
    );
  }

  // Replace contact info placeholders
  if (structuredCvData.personalInfo?.email) {
    processedHtml = processedHtml.replace(
      /\[Email\]/g,
      structuredCvData.personalInfo.email
    );
  }

  if (structuredCvData.personalInfo?.phone) {
    processedHtml = processedHtml.replace(
      /\[Phone\]/g,
      structuredCvData.personalInfo.phone
    );
  }

  // Replace LinkedIn/GitHub if available
  if (structuredCvData.personalInfo?.linkedin) {
    processedHtml = processedHtml.replace(
      /\[LinkedIn\]/g,
      structuredCvData.personalInfo.linkedin
    );
  }

  if (structuredCvData.personalInfo?.github) {
    processedHtml = processedHtml.replace(
      /\[GitHub\]/g,
      structuredCvData.personalInfo.github
    );
  }

  // Replace job title placeholders with actual work experience
  if (
    structuredCvData.workExperience &&
    structuredCvData.workExperience.length > 0
  ) {
    const latestJob = structuredCvData.workExperience[0];
    if (latestJob.jobTitle) {
      processedHtml = processedHtml.replace(
        /\[Job Title\]/g,
        latestJob.jobTitle
      );
      processedHtml = processedHtml.replace(
        /\[Current Job Title\]/g,
        latestJob.jobTitle
      );
    }
    if (latestJob.company) {
      processedHtml = processedHtml.replace(/\[Company\]/g, latestJob.company);
      processedHtml = processedHtml.replace(
        /\[Current Company\]/g,
        latestJob.company
      );
    }
    if (latestJob.startDate && latestJob.endDate) {
      processedHtml = processedHtml.replace(
        /\[Start Date\] - \[End Date\]/g,
        `${latestJob.startDate} - ${latestJob.endDate}`
      );
      processedHtml = processedHtml.replace(
        /\[Start Date\]/g,
        latestJob.startDate
      );
      processedHtml = processedHtml.replace(/\[End Date\]/g, latestJob.endDate);
    }
  }

  // Replace education placeholders
  if (structuredCvData.education && structuredCvData.education.length > 0) {
    const latestEducation = structuredCvData.education[0];
    if (latestEducation.degree) {
      processedHtml = processedHtml.replace(
        /\[Degree\]/g,
        latestEducation.degree
      );
    }
    if (latestEducation.institution) {
      processedHtml = processedHtml.replace(
        /\[Institution\]/g,
        latestEducation.institution
      );
    }
    if (latestEducation.graduationDate) {
      processedHtml = processedHtml.replace(
        /\[Graduation Date\]/g,
        latestEducation.graduationDate
      );
    }
  }

  return processedHtml;
}

// Helper function to format structured CV data for the AI prompt
function formatCvDataForPrompt(structuredData: any): string {
  if (!structuredData) return "No CV data available";

  const personalInfo = structuredData.personalInfo || {};
  const workExperience = structuredData.workExperience || [];
  const education = structuredData.education || [];
  const skills = structuredData.skills || {};
  const projects = structuredData.projects || [];

  return `
PERSONAL INFORMATION:
Name: ${personalInfo.fullName || "Not provided"}
Email: ${personalInfo.email || "Not provided"}
Phone: ${personalInfo.phone || "Not provided"}
LinkedIn: ${personalInfo.linkedin || "Not provided"}
GitHub: ${personalInfo.github || "Not provided"}
Address: ${personalInfo.address || "Not provided"}

PROFESSIONAL SUMMARY:
${structuredData.professionalSummary || "Not provided"}

WORK EXPERIENCE:
${workExperience
  .map(
    (exp: any, index: number) => `
${index + 1}. ${exp.jobTitle || "Position"} at ${exp.company || "Company"}
   Duration: ${exp.startDate || "Start"} - ${exp.endDate || "End"}
   Location: ${exp.location || "Not specified"}
   Description: ${exp.description || "No description"}
   Key Achievements:
   ${(exp.keyAchievements || [])
     .map((achievement: string) => `   - ${achievement}`)
     .join("\n")}
`
  )
  .join("\n")}

EDUCATION:
${education
  .map(
    (edu: any, index: number) => `
${index + 1}. ${edu.degree || "Degree"} from ${edu.institution || "Institution"}
   Graduation: ${edu.graduationDate || "Not specified"}
   GPA: ${edu.gpa || "Not specified"}
   Honors: ${edu.honors || "None"}
   Location: ${edu.location || "Not specified"}
`
  )
  .join("\n")}

SKILLS:
Technical Skills: ${(skills.technical || []).join(", ") || "None listed"}
Soft Skills: ${(skills.soft || []).join(", ") || "None listed"}
Certifications: ${(skills.certifications || []).join(", ") || "None listed"}
Languages: ${
    (skills.languages || [])
      .map((lang: any) => `${lang.language} (${lang.proficiency})`)
      .join(", ") || "None listed"
  }

PROJECTS:
${projects
  .map(
    (project: any, index: number) => `
${index + 1}. ${project.name || "Project"}
   Description: ${project.description || "No description"}
   Technologies: ${(project.technologies || []).join(", ") || "Not specified"}
   Link: ${project.link || "Not provided"}
`
  )
  .join("\n")}

AWARDS: ${(structuredData.awards || []).join(", ") || "None listed"}

VOLUNTEERING:
${(structuredData.volunteering || [])
  .map(
    (vol: any, index: number) => `
${index + 1}. ${vol.role || "Role"} at ${vol.organization || "Organization"}
   Duration: ${vol.duration || "Not specified"}
   Description: ${vol.description || "No description"}
`
  )
  .join("\n")}
`;
}

const prompt = ai.definePrompt({
  name: "tailorCvPrompt",
  input: {
    schema: z.object({
      cvData: z.string().describe("Formatted CV data in text format"),
      jobDescription: z.string().describe("The job description for the role"),
    }),
  },
  output: { schema: TailorCvOutputSchema },
  prompt: `You are an expert resume tailor and career advisor. You will be given structured CV data and a job description. Create a professionally tailored CV that highlights the most relevant skills, experience, and achievements for the specific job.

CRITICAL INSTRUCTIONS:
- You MUST use the actual data provided below in the CV DATA section
- DO NOT use placeholders like [Full Name], [Email], [Job Title], etc.
- Use the REAL information from the person's CV data
- If any specific data shows "Not provided" or is missing, omit that section gracefully

FORMATTING REQUIREMENTS:
- Use clean, semantic HTML with consistent structure
- Use proper heading hierarchy (h1 for name, h2 for sections, h3 for subsections)
- Use <p> tags for paragraphs and descriptions
- Use <ul> and <li> tags for lists and bullet points
- Use <strong> for emphasis and important information
- NO inline CSS or styling - keep it semantic for maximum ATS compatibility

CONTENT STRUCTURE:
1. **Header Section**: Start with h1 for full name, then contact information
2. **Professional Summary**: h2 section with tailored summary
3. **Core Competencies**: h2 section with relevant skills as bullet list
4. **Professional Experience**: h2 section with job history
5. **Education**: h2 section with educational background
6. **Additional Sections**: Include if relevant (projects, certifications, etc.)

TAILORING STRATEGY:
- Analyze the job description keywords and requirements
- Emphasize matching skills and experience from the CV data
- Reorder content to highlight most relevant achievements
- Use similar language and terminology from the job posting
- Quantify achievements where available in the original data

OUTPUT FORMAT:
Provide ONLY clean HTML content. Start with the actual name as h1, then structured sections. Do not include CSS, head tags, or html/body wrapper tags.

CV DATA:
{{{cvData}}}

JOB DESCRIPTION:
{{{jobDescription}}}

Now create a tailored CV using the above CV data, emphasizing skills and experience that match the job description requirements.`,
});

const PromptInputSchema = z.object({
  cvData: z.string().describe("Formatted CV data in text format"),
  jobDescription: z.string().describe("The job description for the role"),
});

const tailorCvFlow = ai.defineFlow(
  {
    name: "tailorCvFlow",
    inputSchema: PromptInputSchema,
    outputSchema: TailorCvOutputSchema,
  },
  async (input) => {
    // Retry logic for Gemini API 503 errors
    let attempts = 0;
    const maxAttempts = 3;
    const baseDelay = 2000; // 2 seconds
    while (attempts < maxAttempts) {
      try {
        const { output } = await prompt(input);
        return output!;
      } catch (err) {
        // Check for 503 error
        const errorMessage =
          typeof err === "object" && err !== null && "message" in err
            ? String((err as any).message)
            : String(err);
        if (
          errorMessage.includes("503") ||
          errorMessage.includes("overloaded")
        ) {
          attempts++;
          if (attempts < maxAttempts) {
            const delay = baseDelay * attempts;
            console.warn(
              `Gemini API overloaded, retrying in ${delay}ms (attempt ${attempts})...`
            );
            await new Promise((res) => setTimeout(res, delay));
            continue;
          }
        }
        throw err;
      }
    }
    throw new Error("Gemini API is overloaded. Please try again later.");
  }
);

export async function tailorCv(input: TailorCvInput): Promise<TailorCvOutput> {
  // Add debugging to see what data we're receiving
  console.log(
    "CV Tailoring Input - Structured Data:",
    JSON.stringify(input.structuredCvData, null, 2)
  );
  console.log(
    "CV Tailoring Input - Job Description Length:",
    input.jobDescription?.length || 0
  );

  // Validate that we have structured CV data
  if (!input.structuredCvData) {
    throw new Error("No structured CV data provided to tailoring function");
  }

  // Validate essential fields
  const personalInfo = input.structuredCvData.personalInfo;
  if (!personalInfo?.fullName) {
    console.warn("Warning: No full name found in structured CV data");
  }
  if (!personalInfo?.email) {
    console.warn("Warning: No email found in structured CV data");
  }

  // Format the CV data for the prompt
  const formattedCvData = formatCvDataForPrompt(input.structuredCvData);
  console.log("Formatted CV Data for AI:", formattedCvData.substring(0, 500));

  // Create modified input with formatted data
  const promptInput = {
    cvData: formattedCvData,
    jobDescription: input.jobDescription,
  };

  const result = await tailorCvFlow(promptInput);

  // Add debugging to see what the AI generated
  console.log("CV Tailoring Output Length:", result.tailoredCv?.length || 0);
  console.log(
    "CV Tailoring Output Preview:",
    result.tailoredCv?.substring(0, 200)
  );

  // Check if the output contains placeholders and fix them
  if (result.tailoredCv && result.tailoredCv.includes("[")) {
    console.log(
      "Detected placeholders in CV output, applying post-processing..."
    );
    result.tailoredCv = replacePlaceholders(
      result.tailoredCv,
      input.structuredCvData
    );
    console.log(
      "Post-processed CV Preview:",
      result.tailoredCv?.substring(0, 200)
    );
  }

  return result;
}
