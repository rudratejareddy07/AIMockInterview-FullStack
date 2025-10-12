import { config } from 'dotenv';
config();

import '@/ai/flows/generate-interview-feedback.ts';
import '@/ai/flows/real-time-transcription.ts';
import '@/ai/flows/interview-agent.ts';
