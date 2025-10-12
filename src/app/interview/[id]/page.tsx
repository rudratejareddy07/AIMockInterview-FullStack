import InterviewRoom from "@/components/interview/interview-room";
import { v4 as uuidv4 } from 'uuid';

export default function InterviewPage({ params, searchParams }: { params: { id: string }, searchParams: { topic: string } }) {
  const roomName = params.id;
  const participantName = `user-${uuidv4().substring(0, 5)}`;
  const interviewTopic = searchParams.topic || "General";

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <InterviewRoom roomName={roomName} participantName={participantName} interviewTopic={interviewTopic} />
    </div>
  );
}
