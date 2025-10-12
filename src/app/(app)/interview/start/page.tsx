import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Code, Database, Network, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from 'uuid';

const interviewTopics = [
    { name: "Frontend", icon: <Code className="h-8 w-8 text-primary" /> },
    { name: "Backend", icon: <Database className="h-8 w-8 text-primary" /> },
    { name: "Data Structures", icon: <BrainCircuit className="h-8 w-8 text-primary" /> },
    { name: "System Design", icon: <Network className="h-8 w-8 text-primary" /> }
];

export default function StartInterviewPage() {
    const newInterviewId = uuidv4();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Start a New Interview</h1>
        <p className="text-muted-foreground">Choose a topic to begin your mock interview session.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {interviewTopics.map((topic) => (
          <Card key={topic.name} className="hover:shadow-lg hover:border-primary transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{topic.name}</CardTitle>
              {topic.icon}
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full mt-4 bg-accent hover:bg-accent/90">
                <Link href={`/interview/${newInterviewId}?topic=${topic.name}`}>
                  Start Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
