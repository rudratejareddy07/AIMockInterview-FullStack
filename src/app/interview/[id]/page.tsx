import InterviewRoom from "@/components/interview/interview-room";
import { v4 as uuidv4 } from 'uuid';

export default function InterviewPage({ params }: { params: { id: string } }) {
  const roomName = params.id;
  const participantName = `user-${uuidv4().substring(0, 5)}`;

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <InterviewRoom roomName={roomName} participantName={participantName} />
    </div>
  );
}
