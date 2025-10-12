"use server";

import { AccessToken } from "livekit-server-sdk";
import { config } from "./config";
import { v4 as uuidv4 } from "uuid";

export async function generateToken(roomName: string, participantName: string) {
  if (!config.livekit.apiKey || !config.livekit.apiSecret || !config.livekit.wsUrl) {
    throw new Error("LiveKit server environment variables are not set.");
  }

  const at = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
    identity: participantName,
    name: participantName,
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });
  
  return await at.toJwt();
}

// In a real app, you would save this to a database.
// For now, we'll just log it to the console.
export async function saveInterviewTranscript(interviewId: string, transcript: string) {
    console.log(`Saving transcript for interview ${interviewId}`);
    // This is where you would interact with MongoDB/Mongoose
    // e.g., await InterviewModel.updateOne({ id: interviewId }, { transcript });
    return { success: true };
}
