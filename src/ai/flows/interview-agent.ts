'use server';

/**
 * @fileOverview An interview agent that can respond to a user.
 *
 * - interviewAgent - A function that handles the interview agent process.
 * - InterviewAgentInput - The input type for the interviewAgent function.
 * - InterviewAgentOutput - The return type for the interviewAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterviewAgentInputSchema = z.object({
  interviewTopic: z.string().describe('The topic of the interview.'),
  jobDescription: z.string().optional().describe('The job description for the role.'),
  transcript: z.string().describe('The running transcript of the interview.'),
});
export type InterviewAgentInput = z.infer<typeof InterviewAgentInputSchema>;

const InterviewAgentOutputSchema = z.object({
  responseText: z.string().describe("The agent's response to the user."),
});
export type InterviewAgentOutput = z.infer<typeof InterviewAgentOutputSchema>;

export async function interviewAgent(input: InterviewAgentInput): Promise<InterviewAgentOutput> {
  return interviewAgentFlow(input);
}

const interviewAgentFlow = ai.defineFlow(
  {
    name: 'interviewAgentFlow',
    inputSchema: InterviewAgentInputSchema,
    outputSchema: InterviewAgentOutputSchema,
  },
  async ({interviewTopic, jobDescription, transcript}) => {
    const prompt = `You are an AI interviewer conducting a mock technical interview.
The interview topic is: ${interviewTopic}.
${ jobDescription ? `The interview is for a role with the following job description:\n${jobDescription}` : ''}

Here is the transcript so far:
${transcript}

Your role is to act as the interviewer. Ask the next logical question based on the conversation and the job description if provided. Keep your questions concise.
Your response should be just the question or comment, without any preamble like "AI:" or "Interviewer:".`;

    const {output} = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.5-flash',
      output: {
        schema: z.object({
          responseText: z.string(),
        }),
      },
    });

    if (!output?.responseText) {
      throw new Error('No text response from model');
    }

    return {
      responseText: output.responseText,
    };
  }
);
