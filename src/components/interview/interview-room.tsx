
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LiveKitRoom, VideoConference, useTracks } from '@livekit/components-react';
import { Room, Track, createLocalAudioTrack, LocalAudioTrack, RemoteTrackPublication, RemoteParticipant, RoomEvent } from 'livekit-client';
import { generateToken, saveInterviewTranscript } from '@/lib/actions';
import { realTimeTranscription } from '@/ai/flows/real-time-transcription';
import { interviewAgent } from '@/ai/flows/interview-agent';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2 } from 'lucide-react';

interface InterviewRoomProps {
  roomName: string;
  participantName: string;
  interviewTopic: string;
}

function AudioTranscriptionHandler({
  onTranscript,
  onError,
}: {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
}) {
  const tracks = useTracks([Track.Source.Microphone]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const localMicTrack = tracks.find(
      (track) => track.source === Track.Source.Microphone && track.participant.isLocal
    );

    if (localMicTrack?.mediaStream) {
      if (mediaRecorderRef.current?.state === 'recording') {
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
              console.error('Transcription error:', err);
              onError('Transcription failed. Please check your connection.');
            }
          };
        }
      };

      mediaRecorder.start(3000); // Capture 3-second chunks
    }

    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [tracks, onTranscript, onError]);

  return null;
}

export default function InterviewRoom({ roomName, participantName, interviewTopic }: InterviewRoomProps) {
  const [token, setToken] = useState<string>('');
  const [agentToken, setAgentToken] = useState<string>('');
  const [fullTranscript, setFullTranscript] = useState<string[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const aiAvatar = PlaceHolderImages.find((p) => p.id === 'ai-avatar');
  const agentRoomRef = useRef<Room | null>(null);
  const audioTrackRef = useRef<LocalAudioTrack | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const userJwt = await generateToken(roomName, participantName);
        setToken(userJwt);
        const agentJwt = await generateToken(roomName, 'AI-Interviewer');
        setAgentToken(agentJwt);
      } catch (e) {
        console.error(e);
        toast({
          title: 'Error',
          description: 'Failed to connect to the interview room.',
          variant: 'destructive',
        });
      }
    })();
  }, [roomName, participantName, toast]);

  const handleAgentResponse = useCallback(
    async (transcriptHistory: string[]) => {
      if (isAgentSpeaking) return;
      setIsAgentSpeaking(true);

      try {
        const { responseText, audioDataUri } = await interviewAgent({
          interviewTopic,
          transcript: transcriptHistory.join('\n'),
        });
        
        setFullTranscript((prev) => [...prev, `AI: ${responseText}`]);

        if (audioElRef.current) {
          audioElRef.current.src = audioDataUri;
          audioElRef.current.play().catch(e => console.error("Audio play failed", e));
          audioElRef.current.onended = () => {
            setIsAgentSpeaking(false);
          };
        }

      } catch (e) {
        console.error('Agent error', e);
        toast({
          title: 'AI Error',
          description: 'The AI agent failed to respond.',
          variant: 'destructive',
        });
        setIsAgentSpeaking(false);
      }
    },
    [interviewTopic, toast, isAgentSpeaking]
  );
  
  useEffect(() => {
    if (!token) return;
    const room = new Room();
    room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);
    
    const handleTrackSubscribed = (track: Track, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        if(track.kind === Track.Kind.Audio && participant.identity === 'AI-Interviewer') {
            const el = track.attach();
            document.body.appendChild(el);
            el.play().catch(e => console.error("Could not play agent audio", e));
        }
    }
    
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);

    return () => {
        room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
        room.disconnect();
    }
  }, [token]);

  // Initial greeting from AI
  useEffect(() => {
    if (fullTranscript.length === 0) {
      const initialTranscript = ['AI: Hello, let\'s begin. I will ask you a series of questions related to your chosen topic. Please answer clearly.'];
      setFullTranscript(initialTranscript);
      handleAgentResponse(initialTranscript);
    }
  }, [handleAgentResponse, fullTranscript.length]);


  useEffect(() => {
    if (!agentToken || agentRoomRef.current) return;
    
    const room = new Room();
    agentRoomRef.current = room;

    room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, agentToken)
      .then(() => {
        console.log('AI Agent connected to the room');
      });

    return () => {
      room.disconnect();
      agentRoomRef.current = null;
    };
  }, [agentToken]);

  const handleTranscript = useCallback(
    (text: string) => {
      if (!text || isAgentSpeaking) return;
      const newUserLine = `User: ${text}`;
      setFullTranscript((prev) => {
        const updatedTranscript = [...prev, newUserLine];
        handleAgentResponse(updatedTranscript);
        return updatedTranscript;
      });
    },
    [isAgentSpeaking, handleAgentResponse]
  );

  const handleTranscriptionError = useCallback(
    (error: string) => {
      toast({
        title: 'Transcription Error',
        description: error,
        variant: 'destructive',
      });
    },
    [toast]
  );

  const handleEndInterview = async () => {
    setIsEnding(true);
    try {
      const finalTranscript = fullTranscript.join('\n');
      await saveInterviewTranscript(roomName, finalTranscript);

      toast({
        title: 'Interview Ended',
        description: 'Generating your feedback report...',
      });

      const encodedTranscript = encodeURIComponent(finalTranscript);
      router.push(`/report/${roomName}?transcript=${encodedTranscript}`);
    } catch (e) {
      console.error('Failed to end interview:', e);
      toast({
        title: 'Error',
        description: 'Could not save interview data. Please try again.',
        variant: 'destructive',
      });
      setIsEnding(false);
    }
  };

  if (token === '') {
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
      style={{ height: '100vh' }}
      onDisconnected={() => handleEndInterview()}
    >
      <audio ref={audioElRef} style={{ display: 'none' }} />
      <div className="h-full flex flex-col md:flex-row p-4 gap-4">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
            <VideoConference />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex justify-center items-center gap-4">
            <button
              onClick={handleEndInterview}
              disabled={isEnding}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 flex items-center gap-2"
            >
              {isEnding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ending...
                </>
              ) : (
                'End Interview'
              )}
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/3 xl:w-1/4 bg-gray-800 rounded-lg p-4 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            {aiAvatar && (
              <Image
                src={aiAvatar.imageUrl}
                alt={aiAvatar.description}
                data-ai-hint={aiAvatar.imageHint}
                width={60}
                height={60}
                className="rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-bold font-headline">AI Interviewer</h2>
              <p className="text-sm text-green-400">{isAgentSpeaking ? 'Speaking...' : 'Listening...'}</p>
            </div>
          </div>
          <div className="flex-1 bg-gray-900 rounded-lg p-3 overflow-y-auto">
            {fullTranscript.map((line, index) => (
              <p key={index} className="text-sm mb-2">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
      <AudioTranscriptionHandler onTranscript={handleTranscript} onError={handleTranscriptionError} />
    </LiveKitRoom>
  );
}
