
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import InterviewRoom from "@/components/interview/interview-room";
import { v4 as uuidv4 } from 'uuid';
import { Loader2 } from 'lucide-react';

export default function InterviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const [roomName, setRoomName] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);

  const interviewTopic = searchParams.get('topic') || "General";
  const jobDescription = searchParams.get('jobDescription') || "";

  useEffect(() => {
    let currentRoomName = params.id as string;

    if (currentRoomName === 'new') {
      currentRoomName = uuidv4();
      const query = searchParams.toString();
      router.replace(`/interview/${currentRoomName}?${query}`);
    } else {
      setRoomName(currentRoomName);
      setParticipantName(`user-${uuidv4().substring(0, 5)}`);
    }
  }, [params.id, router, searchParams]);

  if (!roomName || !participantName) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-lg">Setting up interview room...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <InterviewRoom 
        roomName={roomName} 
        participantName={participantName} 
        interviewTopic={interviewTopic} 
        jobDescription={jobDescription} 
      />
    </div>
  );
}
