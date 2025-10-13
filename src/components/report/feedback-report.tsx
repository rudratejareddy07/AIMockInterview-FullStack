"use client";

import { useEffect, useState } from "react";
import { generateInterviewFeedback, GenerateInterviewFeedbackOutput } from "@/ai/flows/generate-interview-feedback";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Progress } from "@/components/ui/progress";

export default function FeedbackReport({ transcript }: { transcript: string }) {
  const [report, setReport] = useState<GenerateInterviewFeedbackOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transcript) {
      generateInterviewFeedback({ interviewTranscript: transcript })
        .then((result) => {
          setReport(result);
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

  if (!report) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <p>Analyzing your performance and generating feedback...</p>
      </div>
    );
  }
  
  const { overallRating, categoryRatings } = report;

  const RatingCard = ({ title, rating, feedback }: { title: string, rating: number, feedback: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold">{rating}/10</span>
          <Progress value={rating * 10} className="w-full" />
        </div>
        <div className="prose prose-blue dark:prose-invert max-w-none text-sm text-muted-foreground">
          <ReactMarkdown>{feedback}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
        <Card className="gradient-card">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Overall Score</CardTitle>
                <CardDescription>Your average performance rating for this interview.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold">{overallRating}/10</span>
                    <Progress value={overallRating * 10} className="w-full" />
                </div>
            </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-headline font-bold mb-4">Detailed Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RatingCard title="Technical Skills" {...categoryRatings.technical} />
            <RatingCard title="Communication" {...categoryRatings.communication} />
            <RatingCard title="Behavioral Traits" {...categoryRatings.behavioral} />
          </div>
        </div>
    </div>
  );
}
