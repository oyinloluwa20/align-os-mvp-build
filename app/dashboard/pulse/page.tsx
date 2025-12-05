"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const questions = [
  {
    id: "vision",
    label: "How aligned do you feel with the vision right now?",
    description: "Consider: Are we on the same page about where we're headed?",
  },
  {
    id: "workload",
    label: "How fairly is workload distributed?",
    description: "Consider: Is everyone pulling their weight?",
  },
  {
    id: "communication",
    label: "How healthy is our communication?",
    description: "Consider: Are we being open and honest with each other?",
  },
  {
    id: "strategy",
    label: "How confident are you in our strategy?",
    description: "Consider: Do we have a clear path forward?",
  },
  {
    id: "wellbeing",
    label: "How is your personal well-being?",
    description: "Consider: Are you at risk of burnout?",
  },
]

export default function PulsePage() {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleScoreChange = (questionId: string, score: number) => {
    setScores((prev) => ({ ...prev, [questionId]: score }))
  }

  const handleSubmit = async () => {
    if (Object.keys(scores).length < 5) {
      toast.error("Please answer all questions")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: profile } = await supabase.from("profiles").select("workspace_id").eq("id", user.id).single()

      if (!profile?.workspace_id) {
        throw new Error("No workspace found")
      }

      // Get or create current week's pulse
      const weekStart = getWeekStart(new Date())
      let { data: pulse } = await supabase
        .from("pulses")
        .select("*")
        .eq("workspace_id", profile.workspace_id)
        .eq("week_start", weekStart)
        .single()

      if (!pulse) {
        const { data: newPulse, error: pulseError } = await supabase
          .from("pulses")
          .insert({
            workspace_id: profile.workspace_id,
            week_start: weekStart,
          })
          .select()
          .single()

        if (pulseError) throw pulseError
        pulse = newPulse
      }

      // Submit response
      const { error: responseError } = await supabase.from("pulse_responses").upsert({
        pulse_id: pulse.id,
        user_id: user.id,
        vision_score: scores.vision,
        workload_score: scores.workload,
        communication_score: scores.communication,
        strategy_score: scores.strategy,
        wellbeing_score: scores.wellbeing,
        open_feedback: feedback || null,
      })

      if (responseError) throw responseError

      // Check if all co-founders have submitted
      const { data: profiles } = await supabase.from("profiles").select("id").eq("workspace_id", profile.workspace_id)

      const { data: responses } = await supabase.from("pulse_responses").select("id").eq("pulse_id", pulse.id)

      if (profiles && responses && responses.length >= profiles.length) {
        await supabase
          .from("pulses")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", pulse.id)
      } else {
        await supabase.from("pulses").update({ status: "partial" }).eq("id", pulse.id)
      }

      toast.success("Pulse submitted successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
      toast.error("Failed to submit pulse")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Weekly Alignment Pulse</h1>
        <p className="mt-2 text-muted-foreground">
          Take a moment to reflect on how things are going with your co-founders. Your responses are anonymous until
          everyone has submitted.
        </p>
      </div>

      <div className="space-y-8">
        {questions.map((question) => (
          <div key={question.id} className="glass rounded-xl p-6">
            <Label className="text-base font-medium">{question.label}</Label>
            <p className="mt-1 text-sm text-muted-foreground">{question.description}</p>
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleScoreChange(question.id, score)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                    scores[question.id] === score
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary hover:bg-primary/10"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Not at all</span>
              <span>Extremely</span>
            </div>
          </div>
        ))}

        <div className="glass rounded-xl p-6">
          <Label className="text-base font-medium">
            {"What's one thing your co-founder(s) should start, stop, or continue?"}
          </Label>
          <p className="mt-1 text-sm text-muted-foreground">
            Be constructive. This feedback will be shared anonymously.
          </p>
          <Textarea
            className="mt-4"
            placeholder="Share your thoughts..."
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Pulse"}
        </Button>
      </div>
    </div>
  )
}

function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split("T")[0]
}
