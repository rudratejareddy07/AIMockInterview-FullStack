import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { performanceData, mockInterviews } from "@/lib/data"
import PerformanceChart from "@/components/dashboard/performance-chart"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"

export default function DashboardPage() {
  const latestInterviews = mockInterviews.slice(0, 5);

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="font-headline">Performance Overview</CardTitle>
            <CardDescription>Your average scores over the last few interviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={performanceData} />
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle className="font-headline">Recent Interviews</CardTitle>
                    <CardDescription>
                    A log of your most recent practice sessions.
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/history">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Interview Type</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {latestInterviews.map((interview) => (
                        <TableRow key={interview.id}>
                            <TableCell>
                            <Link href={`/report/${interview.id}`} className="font-medium hover:underline">
                                {interview.interviewType}
                            </Link>
                            </TableCell>
                            <TableCell className="text-center">
                            <Badge variant={interview.score >= 8 ? "default" : "secondary"} className={interview.score >= 8 ? "bg-green-500/20 text-green-700 border-green-500/30" : "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"}>
                                {interview.score}/10
                            </Badge>
                            </TableCell>
                            <TableCell className="text-right">{new Date(interview.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
