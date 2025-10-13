'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating interview feedback.
 *
 * - generateInterviewFeedback -  A function that takes interview transcript and generates feedback report.
 * - GenerateInterviewFeedbackInput - The input type for the generateInterviewFeedback function.
 * - GenerateInterviewFeedbackOutput - The return type for the generateInterviewFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewFeedbackInputSchema = z.object({
  interviewTranscript: z
    .string()
    .describe('The transcript of the interview between the AI and the user.'),
});
export type GenerateInterviewFeedbackInput = z.infer<typeof GenerateInterviewFeedbackInputSchema>;

const GenerateInterviewFeedbackOutputSchema = z.object({
  rating: z.number().describe("A rating of the user's performance on a scale of 1 to 10."),
  feedbackReport: z
    .string()
    .describe(
      'A detailed performance report, highlighting strengths, weaknesses, and areas for improvement based on technical accuracy, verbal fluency, and soft skills.'
    ),
});
export type GenerateInterviewFeedbackOutput = z.infer<typeof GenerateInterviewFeedbackOutputSchema>;

export async function generateInterviewFeedback(
  input: GenerateInterviewFeedbackInput
): Promise<GenerateInterviewFeedbackOutput> {
  return generateInterviewFeedbackFlow(input);
}

const generateInterviewFeedbackPrompt = ai.definePrompt({
  name: 'generateInterviewFeedbackPrompt',
  input: {schema: GenerateInterviewFeedbackInputSchema},
  output: {schema: GenerateInterviewFeedbackOutputSchema},
  prompt: `You are an AI interview feedback generator. Analyze the following interview transcript and provide a detailed performance report, highlighting strengths, weaknesses, and areas for improvement based on technical accuracy, verbal fluency, and soft skills. Also, provide a rating of the user's performance on a scale of 1 to 10.\n\nInterview Transcript: {{{interviewTranscript}}}`,
});

const generateInterviewFeedbackFlow = ai.defineFlow(
  {
    name: 'generateInterviewFeedbackFlow',
    inputSchema: GenerateInterviewFeedbackInputSchema,
    outputSchema: GenerateInterviewFeedbackOutputSchema,
  },
  async input => {
    const {output} = await generateInterviewFeedbackPrompt(input);
    return output!;
  }
);
