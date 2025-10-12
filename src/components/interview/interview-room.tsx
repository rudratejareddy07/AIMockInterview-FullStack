"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { generateToken, saveInterviewTranscript } from "@/lib/actions";
import { realTimeTranscription } from "@/ai/flows/real-time-transcription";
import { interviewAgent } from "@/ai/flows/interview-agent";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Loader2 } from "lucide-react";

interface InterviewRoomProps {
  roomName: string;
  participantName: string;
  interviewTopic: string;
}

function AudioTranscriptionHandler({ onTranscript, onError }: { onTranscript: (text: string) => void, onError: (error: string) => void }) {
  const tracks = useTracks([Track.Source.Microphone]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const localMicTrack = tracks.find(
      (track) => track.source === Track.Source.Microphone && track.participant.isLocal
    );

    if (localMicTrack?.mediaStream) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }

      const mediaRecorder = new MediaRecorder(localMicTrack.mediaStream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.readAsDataURL(event.data);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            try {
              const { transcription } = await realTimeTranscription({ audioDataUri: base64Audio });
              if (transcription) {
                onTranscript(transcription);
              }
            } catch (err) {
              console.error("Transcription error:", err);
              onError("Transcription failed. Please check your connection.");
            }
          };
        }
      };
      
      mediaRecorder.start(3000); // Capture 3-second chunks
    }

    return () => {
      mediaRecorderRef.current?.stop();
    };
  }, [tracks, onTranscript, onError]);

  return null;
}


export default function InterviewRoom({ roomName, participantName, interviewTopic }: InterviewRoomProps) {
  const [token, setToken] = useState<string>("");
  const [fullTranscript, setFullTranscript] = useState<string[]>(["AI: Hello, let's begin. I will ask you a series of questions related to your chosen topic. Please answer clearly."]);
  const [isEnding, setIsEnding] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const aiAvatar = PlaceHolderImages.find(p => p.id === 'ai-avatar');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const jwt = await generateToken(roomName, participantName);
        setToken(jwt);
      } catch (e) {
        console.error(e);
        toast({
            title: "Error",
            description: "Failed to connect to the interview room.",
            variant: "destructive",
        })
      }
    })();
  }, [roomName, participantName, toast]);

  const handleAgentResponse = useCallback(async (transcriptHistory: string[]) => {
    setIsAgentSpeaking(true);
    try {
      const { responseText, audioDataUri } = await interviewAgent({
        interviewTopic,
        transcript: transcriptHistory.join('\n'),
      });
      setFullTranscript(prev => [...prev, `AI: ${responseText}`]);
      if (audioRef.current) {
        audioRef.current.src = audioDataUri;
        audioRef.current.play();
        audioRef.current.onended = () => setIsAgentSpeaking(false);
      }
    } catch (e) {
      console.error("Agent error", e);
      toast({
        title: "AI Error",
        description: "The AI agent failed to respond.",
        variant: "destructive"
      });
      setIsAgentSpeaking(false);
    }
  }, [interviewTopic, toast]);

  const handleTranscript = useCallback((text: string) => {
    const newUserLine = `User: ${text}`;
    const updatedTranscript = [...fullTranscript, newUserLine];
    setFullTranscript(updatedTranscript);
    if (!isAgentSpeaking) {
      handleAgentResponse(updatedTranscript);
    }
  }, [fullTranscript, isAgentSpeaking, handleAgentResponse]);

  const handleTranscriptionError = useCallback((error: string) => {
    toast({
        title: "Transcription Error",
        description: error,
        variant: "destructive",
    })
  }, [toast]);

  const handleEndInterview = async () => {
    setIsEnding(true);
    try {
        const finalTranscript = fullTranscript.join('\n');
        await saveInterviewTranscript(roomName, finalTranscript);
        
        toast({
            title: "Interview Ended",
            description: "Generating your feedback report...",
        });
        
        // Pass transcript through query params as a temporary solution
        // In a real app, this would be saved and fetched on the report page
        const encodedTranscript = encodeURIComponent(finalTranscript);
        router.push(`/report/${roomName}?transcript=${encodedTranscript}`);
    } catch (e) {
        console.error("Failed to end interview:", e);
        toast({
            title: "Error",
            description: "Could not save interview data. Please try again.",
            variant: "destructive",
        });
        setIsEnding(false);
    }
  };


  if (token === "") {
    return (
      <div className="flex items-center justify-center h-screen">
         <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-lg">Joining interview room...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100vh" }}
      onDisconnected={() => handleEndInterview()}
    >
        <div className="h-full flex flex-col md:flex-row p-4 gap-4">
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
                    <VideoConference />
                </div>
                <div className="bg-gray-800 p-4 rounded-lg flex justify-center items-center gap-4">
                    {/* Controls will be part of VideoConference, this is for custom actions */}
                    <button 
                        onClick={handleEndInterview} 
                        disabled={isEnding}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 flex items-center gap-2">
                        {isEnding ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                Ending...
                            </>
                        ): "End Interview"}
                    </button>
                </div>
            </div>
            <div className="w-full md:w-1/3 xl:w-1/4 bg-gray-800 rounded-lg p-4 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                    {aiAvatar && <Image src={aiAvatar.imageUrl} alt={aiAvatar.description} data-ai-hint={aiAvatar.imageHint} width={60} height={60} className="rounded-full" />}
                    <div>
                        <h2 className="text-xl font-bold font-headline">AI Interviewer</h2>
                        <p className="text-sm text-green-400">{isAgentSpeaking ? 'Speaking...' : 'Listening...'}</p>
                    </div>
                </div>
                <div className="flex-1 bg-gray-900 rounded-lg p-3 overflow-y-auto">
                    {fullTranscript.map((line, index) => (
                        <p key={index} className="text-sm mb-2">{line}</p>
                    ))}
                </div>
            </div>
        </div>
      <AudioTranscriptionHandler onTranscript={handleTranscript} onError={handleTranscriptionError} />
      <audio ref={audioRef} className="hidden" />
    </LiveKitRoom>
  );
}
