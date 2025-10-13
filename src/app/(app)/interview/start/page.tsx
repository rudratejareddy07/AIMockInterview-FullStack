"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = 'force-dynamic';

export default function StartInterviewPage() {
    const [jobDescription, setJobDescription] = useState<string>("");
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const topicQuery = `topic=${encodeURIComponent("General")}`;
        const jobDescQuery = jobDescription ? `&jobDescription=${encodeURIComponent(jobDescription)}` : '';
        
        router.push(`/interview/new?${topicQuery}${jobDescQuery}`);
    };
    
    if (!isClient) {
        return null;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Start a New Interview</h1>
                <p className="text-muted-foreground">Provide a job description to begin your mock interview session.</p>
            </div>
            
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <Label htmlFor="job-description" className="text-lg font-medium">Job Description</Label>
                            <p className="text-sm text-muted-foreground">Paste a job description here to tailor the interview questions to a specific role.</p>
                            <Textarea
                                id="job-description"
                                placeholder="e.g., Senior Frontend Engineer at Acme Inc. responsible for..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="min-h-[150px] resize-y"
                            />
                        </div>

                        <Button type="submit" size="lg" className="w-full md:w-auto">
                            Start Interview
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
