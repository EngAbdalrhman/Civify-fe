'use server';

/**
 * @fileOverview CV tailoring AI agent.
 *
 * - tailorCv - A function that tailors a CV based on a job description.
 * - TailorCvInput - The input type for the tailorCv function.
 * - TailorCvOutput - The return type for the tailorCv function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TailorCvInputSchema = z.object({
  cvText: z
    .string()
    .describe('The text extracted from the user\'s CV.'),
  jobDescription: z.string().describe('The job description for the role the user is applying for.'),
});
export type TailorCvInput = z.infer<typeof TailorCvInputSchema>;

const TailorCvOutputSchema = z.object({
  tailoredCv: z.string().describe('The tailored CV content in HTML format.'),
});
export type TailorCvOutput = z.infer<typeof TailorCvOutputSchema>;

export async function tailorCv(input: TailorCvInput): Promise<TailorCvOutput> {
  return tailorCvFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tailorCvPrompt',
  input: {schema: TailorCvInputSchema},
  output: {schema: TailorCvOutputSchema},
  prompt: `You are an expert resume tailor. You will be given the text from a CV and a job description.  You will reformat the CV to highlight the skills and experience that are most relevant to the job description.  The output should be clean HTML.

CV Text: {{{cvText}}}

Job Description: {{{jobDescription}}}
`,
});

const tailorCvFlow = ai.defineFlow(
  {
    name: 'tailorCvFlow',
    inputSchema: TailorCvInputSchema,
    outputSchema: TailorCvOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
