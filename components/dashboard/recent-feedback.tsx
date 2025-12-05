"use client"

import { MessageSquare } from "lucide-react"

interface Pulse {
  id: string
  week_start: string
  status: string
  pulse_responses: Array<{
    open_feedback: string | null
    submitted_at: string
  }>
}

interface RecentFeedbackProps {
  pulses: Pulse[]
}

export function RecentFeedback({ pulses }: RecentFeedbackProps) {
  const feedback = pulses
    .filter((p) => p.status === "completed")
    .flatMap((p) =>
      p.pulse_responses
        .filter((r) => r.open_feedback)
        .map((r) => ({
          text: r.open_feedback,
          week: new Date(p.week_start).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          date: r.submitted_at,
        })),
    )
    .slice(0, 5)

  // Sample feedback if no data
  const displayFeedback =
    feedback.length > 0
      ? feedback
      : [
          {
            text: "We should have more frequent check-ins about product direction",
            week: "Dec 2",
            date: new Date().toISOString(),
          },
          {
            text: "Great progress on the fundraising front this week!",
            week: "Nov 25",
            date: new Date().toISOString(),
          },
          {
            text: "I'd appreciate more clarity on role responsibilities",
            week: "Nov 18",
            date: new Date().toISOString(),
          },
        ]

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Recent Feedback</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Anonymous feedback from completed pulses</p>
      <div className="mt-4 space-y-4">
        {displayFeedback.map((item, index) => (
          <div key={index} className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm">{item.text}</p>
            <p className="mt-2 text-xs text-muted-foreground">Week of {item.week}</p>
          </div>
        ))}
        {displayFeedback.length === 0 && (
          <p className="text-sm text-muted-foreground">No feedback yet. Complete your first pulse survey!</p>
        )}
      </div>
    </div>
  )
}
