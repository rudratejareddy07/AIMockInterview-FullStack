import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MessageCircle, BarChart2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Logo } from "@/components/logo";

export default function MarketingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  const features = [
    {
      icon: <MessageCircle className="h-10 w-10 text-primary" />,
      title: "Realistic AI Interviews",
      description: "Practice live interviews with an AI that asks relevant questions and simulates a real-world scenario."
    },
    {
      icon: <CheckCircle2 className="h-10 w-10 text-primary" />,
      title: "Instant, Detailed Feedback",
      description: "Receive a comprehensive report on your technical skills, communication, and confidence right after your session."
    },
    {
      icon: <BarChart2 className="h-10 w-10 text-primary" />,
      title: "Track Your Progress",
      description: "Monitor your improvement over time with our performance dashboard and historical feedback."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />
        <Button asChild>
          <Link href="/dashboard">Get Started</Link>
        </Button>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground tracking-tighter">
                Ace Your Next Tech Interview with AI
              </h1>
              <p className="text-lg text-muted-foreground">
                Build confidence, refine your answers, and get instant, actionable feedback on your performance. AI Interview Ace is your personal career coach.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/dashboard">Start Practicing Now</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  className="rounded-xl shadow-2xl"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-card py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Why Choose AI Interview Ace?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Go beyond canned question lists. Our platform provides a dynamic and interactive way to prepare.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center gradient-card border-none shadow-lg">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-2xl pt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AI Interview Ace. All rights reserved.</p>
      </footer>
    </div>
  );
}
