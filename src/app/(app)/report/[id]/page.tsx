import { getInterviewById } from "@/lib/data";
import { notFound } from "next/navigation";
import FeedbackReport from "@/components/report/feedback-report";
import { Suspense } from "react";

export default function ReportPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { transcript?: string };
}) {
  const interview = getInterviewById(params.id);
  const transcriptFromQuery = searchParams.transcript;

  // In a real app, you would fetch the full interview data, including transcript, from your database using the ID.
  // We use a mix of mock data and query param for demonstration.
  const transcript = transcriptFromQuery || interview?.transcript;

  if (!transcript) {
    // If no transcript is found either way, it's an invalid state.
    notFound();
  }

  return (
    <div>
        <div className="mb-6">
            <h1 className="text-3xl font-bold font-headline">Interview Feedback Report</h1>
            <p className="text-muted-foreground">
                For your {interview?.interviewType || 'General'} interview on {interview ? new Date(interview.date).toLocaleDateString() : 'a recent date'}.
            </p>
        </div>
        <Suspense fallback={<p>Generating report...</p>}>
             <FeedbackReport transcript={transcript} />
        </Suspense>
    </div>
  );
}
