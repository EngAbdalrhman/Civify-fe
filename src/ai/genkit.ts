import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

// Ensure environment variables are loaded
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.warn(
    "Warning: GEMINI_API_KEY or GOOGLE_API_KEY environment variable not found"
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
  model: "googleai/gemini-2.0-flash",
});
