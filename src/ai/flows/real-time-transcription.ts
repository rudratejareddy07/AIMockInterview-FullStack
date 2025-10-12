'use server';

/**
 * @fileOverview A real-time transcription AI agent.
 *
 * - realTimeTranscription - A function that handles the real-time transcription process.
 * - RealTimeTranscriptionInput - The input type for the realTimeTranscription function.
 * - RealTimeTranscriptionOutput - The return type for the realTimeTranscription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimeTranscriptionInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'Audio data URI from the user, expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type RealTimeTranscriptionInput = z.infer<typeof RealTimeTranscriptionInputSchema>;

const RealTimeTranscriptionOutputSchema = z.object({
  transcription: z.string().describe('The real-time transcription of the user audio.'),
});
export type RealTimeTranscriptionOutput = z.infer<typeof RealTimeTranscriptionOutputSchema>;

export async function realTimeTranscription(input: RealTimeTranscriptionInput): Promise<RealTimeTranscriptionOutput> {
  return realTimeTranscriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'realTimeTranscriptionPrompt',
  input: {schema: RealTimeTranscriptionInputSchema},
  output: {schema: RealTimeTranscriptionOutputSchema},
  prompt: `Transcribe the following audio in real time:\n\nAudio: {{media url=audioDataUri}}`,
});

const realTimeTranscriptionFlow = ai.defineFlow(
  {
    name: 'realTimeTranscriptionFlow',
    inputSchema: RealTimeTranscriptionInputSchema,
    outputSchema: RealTimeTranscriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
