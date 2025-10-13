'use server';

/**
 * @fileOverview An interview agent that can respond to a user and convert the response to audio.
 *
 * - interviewAgent - A function that handles the interview agent process.
 * - InterviewAgentInput - The input type for the interviewAgent function.
 * - InterviewAgentOutput - The return type for the interviewAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const InterviewAgentInputSchema = z.object({
  interviewTopic: z.string().describe('The topic of the interview.'),
  transcript: z.string().describe('The running transcript of the interview.'),
});
export type InterviewAgentInput = z.infer<typeof InterviewAgentInputSchema>;

const InterviewAgentOutputSchema = z.object({
  responseText: z.string().describe('The agent\'s response to the user.'),
  audioDataUri: z
    .string()
    .describe(
      'The agent\'s response as an audio data URI, expected format: data:audio/wav;base64,<encoded_data>.'
    ),
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
  async ({interviewTopic, transcript}) => {
    const prompt = `You are an AI interviewer conducting a mock technical interview.
The interview topic is: ${interviewTopic}.

Here is the transcript so far:
${transcript}

Your role is to act as the interviewer. Ask the next logical question based on the conversation. Keep your questions concise.
Your response should be just the question or comment, without any preamble like "AI:" or "Interviewer:".`;

    const {output: textResponse} = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.5-flash',
      output: {
        schema: z.object({
          responseText: z.string(),
        }),
      },
    });

    if (!textResponse?.responseText) {
      throw new Error('No text response from model');
    }

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: textResponse.responseText,
    });

    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const audioDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
      responseText: textResponse.responseText,
      audioDataUri,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
