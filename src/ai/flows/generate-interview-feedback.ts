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

const CategoryRatingSchema = z.object({
  rating: z.number().describe('The rating for this category, from 1 to 10.'),
  feedback: z.string().describe('Specific feedback for this category.'),
});

const GenerateInterviewFeedbackOutputSchema = z.object({
  overallRating: z
    .number()
    .describe("A rating of the user's performance on a scale of 1 to 10."),
  categoryRatings: z.object({
    technical: CategoryRatingSchema.describe(
      'Rating and feedback on technical accuracy and knowledge.'
    ),
    communication: CategoryRatingSchema.describe(
      'Rating and feedback on verbal fluency, clarity, and soft skills.'
    ),
    behavioral: CategoryRatingSchema.describe(
      'Rating and feedback on problem-solving approach, confidence, and STAR method usage if applicable.'
    ),
  }),
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
  prompt: `You are an AI interview feedback generator. Analyze the following interview transcript. Provide a detailed performance report with an overall rating and categorized ratings for technical skills, communication, and behavioral aspects. For each category, provide a rating from 1 to 10 and specific, constructive feedback.

Interview Transcript:
{{{interviewTranscript}}}`,
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
