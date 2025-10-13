"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Code, Database, Network, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const interviewTopics = [
    { name: "Frontend", icon: <Code className="h-6 w-6 text-primary" /> },
    { name: "Backend", icon: <Database className="h-6 w-6 text-primary" /> },
    { name: "Data Structures", icon: <BrainCircuit className="h-6 w-6 text-primary" /> },
    { name: "System Design", icon: <Network className="h-6 w-6 text-primary" /> }
];

export const dynamic = 'force-dynamic';

export default function StartInterviewPage() {
    const [topic, setTopic] = useState<string>("");
    const [jobDescription, setJobDescription] = useState<string>("");
    const router = useRouter();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) {
            toast({
                title: "Please select a topic",
                description: "You must choose an interview topic to begin.",
                variant: "destructive",
            });
            return;
        }

        const topicQuery = `topic=${encodeURIComponent(topic)}`;
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
                <p className="text-muted-foreground">Choose a topic and provide a job description to begin your mock interview session.</p>
            </div>
            
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <Label className="text-lg font-medium">1. Select an Interview Topic</Label>
                            <RadioGroup value={topic} onValueChange={setTopic} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {interviewTopics.map((item) => (
                                    <Label key={item.name} htmlFor={item.name} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary transition-colors cursor-pointer">
                                        <RadioGroupItem value={item.name} id={item.name} className="sr-only" />
                                        {item.icon}
                                        <span className="mt-2 text-center font-medium">{item.name}</span>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="job-description" className="text-lg font-medium">2. Add a Job Description (Optional)</Label>
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