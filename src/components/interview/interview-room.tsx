
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LiveKitRoom, RoomAudioRenderer, useTracks, VideoConference } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { generateToken, saveInterviewTranscript } from '@/lib/actions';
import { interviewAgent } from '@/ai/flows/interview-agent';
import { realTimeTranscription } from '@/ai/flows/real-time-transcription';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2, Mic, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface InterviewRoomProps {
  roomName: string;
  participantName: string;
  interviewTopic: string;
  jobDescription?: string;
}

interface InterviewRoomContentProps {
  roomName: string;
  interviewTopic: string;
  jobDescription?: string;
}

function InterviewRoomContent({ roomName, interviewTopic, jobDescription }: InterviewRoomContentProps) {
  const [fullTranscript, setFullTranscript] = useState<string[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const aiAvatar = PlaceHolderImages.find((p) => p.id === 'ai-avatar');

  const userAudioStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const handleAgentResponse = useCallback(
    async (transcriptHistory: string[]) => {
      if (isAgentSpeaking) return;
      console.log('Agent is thinking...');
      setIsAgentSpeaking(true);

      try {
        const { responseText } = await interviewAgent({
          interviewTopic,
          jobDescription,
          transcript: transcriptHistory.join('\n'),
        });
        
        console.log('Agent responded:', responseText);
        setFullTranscript((prev) => [...prev, `AI: ${responseText}`]);

        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(responseText);
        utterance.onend = () => {
            console.log('Agent finished speaking.');
            setIsAgentSpeaking(false);
        };
        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            // Even if speech fails, allow the user to continue.
            setIsAgentSpeaking(false);
        }
        window.speechSynthesis.speak(utterance);

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
    [interviewTopic, jobDescription, toast, isAgentSpeaking]
  );
  
  const handleTranscript = useCallback(
    (text: string) => {
      if (!text || isAgentSpeaking) return;
      console.log('Your transcribed text:', text);
      const newUserLine = `User: ${text}`;
      setFullTranscript((prev) => {
        const updatedTranscript = [...prev, newUserLine];
        handleAgentResponse(updatedTranscript); 
        return updatedTranscript;
      });
    },
    [handleAgentResponse, isAgentSpeaking]
  );

 useEffect(() => {
    const getMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        userAudioStreamRef.current = stream;
      } catch (err) {
        console.error('Error accessing microphone:', err);
        toast({
          title: 'Microphone Permission Denied',
          description:
            'Please allow microphone access in your browser settings to use this feature.',
          variant: 'destructive',
        });
      }
    };
    getMicPermission();
    
    // Start conversation after a short delay
    const timer = setTimeout(() => {
        const initialTranscript = [`User: Hi, I'm ready to start.`];
        setFullTranscript(initialTranscript);
        handleAgentResponse(initialTranscript);
    }, 2000);


    // Cleanup
    return () => {
      clearTimeout(timer);
      userAudioStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  
  const handleTranscriptionError = useCallback(
    (error: string) => {
      toast({
        title: 'Transcription Error',
        description: error,
        variant: 'destructive',
      });
      setIsRecording(false);
      setIsUserSpeaking(false);
    },
    [toast]
  );
  
  const handleToggleRecording = async () => {
    if (isRecording) {
      console.log('Stopping recording...');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      if (!userAudioStreamRef.current) {
        toast({
          title: 'Microphone Error',
          description: 'Could not access microphone. Please check permissions.',
          variant: 'destructive',
        });
        console.error('User media stream is not available.');
        return;
      }
  
      console.log('Starting recording...');
      setIsUserSpeaking(true);
      const mediaRecorder = new MediaRecorder(userAudioStreamRef.current, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
  
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
  
      mediaRecorder.onstop = () => {
        setIsUserSpeaking(false);
        console.log('Recording stopped, creating blob...');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            try {
                console.log('Transcribing audio blob...');
                const { transcription } = await realTimeTranscription({ audioDataUri: base64Audio });
                if (transcription) {
                    handleTranscript(transcription);
                } else {
                    console.log("Transcription returned empty.");
                }
            } catch (err) {
                console.error('Transcription error:', err);
                handleTranscriptionError('Transcription failed. Please check your connection.');
            }
        };

        audioChunksRef.current = [];
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    }
  }


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

  const tracks = useTracks(
    [
      Track.Source.Camera,
      Track.Source.Microphone,
      Track.Source.ScreenShare,
      Track.Source.Unknown,
    ],
    { onlySubscribed: false },
  );

  const userVideoTrack = tracks.find(track => track.source === Track.Source.Camera);

  return (
    <>
        <div className="h-full flex flex-col p-4 gap-4 bg-gray-900 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <Card className="bg-black rounded-lg overflow-hidden flex items-center justify-center">
                    <CardContent className="p-0 w-full h-full flex items-center justify-center relative">
                        {aiAvatar && (
                           <div className="flex flex-col items-center justify-center gap-4">
                             <Image
                                src={aiAvatar.imageUrl}
                                alt={aiAvatar.description}
                                data-ai-hint={aiAvatar.imageHint}
                                width={120}
                                height={120}
                                className="rounded-full"
                            />
                            <p className="font-bold text-lg">AI Interviewer</p>
                           </div>
                        )}
                        <div className="absolute bottom-4 left-4">
                             <p className="text-sm text-green-400">{isAgentSpeaking ? 'Speaking...' : isUserSpeaking ? 'Listening...' : 'Ready'}</p>
                        </div>
                    </CardContent>
                </Card>
                <div className="bg-black rounded-lg overflow-hidden relative">
                    <VideoConference />
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg flex justify-center items-center gap-4">
                <Button
                onClick={handleToggleRecording}
                disabled={isAgentSpeaking}
                className={`px-6 py-3 rounded-full text-white font-bold transition-all duration-300 flex items-center gap-2 ${
                    isRecording ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                }`}
                >
                <Mic className="h-5 w-5" />
                {isRecording ? 'Stop & Reply' : 'Record Answer'}
                </Button>
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
            
            <div className="w-full h-40 bg-gray-800 rounded-lg p-4 flex flex-col">
                <h2 className="text-xl font-bold font-headline mb-2">Transcript</h2>
                <div className="flex-1 bg-gray-900 rounded-lg p-3 overflow-y-auto">
                    {fullTranscript.map((line, index) => (
                    <p key={index} className="text-sm mb-2">
                        {line}
                    </p>
                    ))}
                </div>
            </div>
        </div>
        <RoomAudioRenderer />
    </>
  );
}


export default function InterviewRoom({ roomName, participantName, interviewTopic, jobDescription }: InterviewRoomProps) {
  const [token, setToken] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const userJwt = await generateToken(roomName, participantName);
        setToken(userJwt);
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

  if (token === '') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
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
    >
      <InterviewRoomContent roomName={roomName} interviewTopic={interviewTopic} jobDescription={jobDescription} />
    </LiveKitRoom>
  );
}
