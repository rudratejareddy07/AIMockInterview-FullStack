"use client";

import { useEffect, useState } from "react";
import { generateInterviewFeedback } from "@/ai/flows/generate-interview-feedback";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Progress } from "@/components/ui/progress";

export default function FeedbackReport({ transcript }: { transcript: string }) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transcript) {
      generateInterviewFeedback({ interviewTranscript: transcript })
        .then((result) => {
          setFeedback(result.feedbackReport);
          setRating(result.rating);
        })
        .catch((err) => {
          console.error("Error generating feedback:", err);
          setError("Failed to generate feedback report. Please try again later.");
        });
    }
  }, [transcript]);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!feedback || rating === null) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <p>Analyzing your performance and generating feedback...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {rating !== null && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Overall Score</CardTitle>
                    <CardDescription>Your performance rating for this interview.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-bold">{rating}/10</span>
                        <Progress value={rating * 10} className="w-full" />
                    </div>
                </CardContent>
            </Card>
        )}
        <Card className="gradient-card">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Your Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose prose-blue dark:prose-invert max-w-none">
                    <ReactMarkdown>{feedback}</ReactMarkdown>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
