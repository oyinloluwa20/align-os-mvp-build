import { createClient } from "@/lib/supabase/server"
import { AlignmentScoreCard } from "@/components/dashboard/alignment-score-card"
import { AlignmentChart } from "@/components/dashboard/alignment-chart"
import { RecentFeedback } from "@/components/dashboard/recent-feedback"
import { ActionItemsList } from "@/components/dashboard/action-items-list"
import { EmergencyCallBanner } from "@/components/dashboard/emergency-call-banner"
import { PulseStatus } from "@/components/dashboard/pulse-status"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("*, workspace:workspaces(*)").single()

  // Calculate alignment score from recent pulses
  const { data: recentPulses } = await supabase
    .from("pulses")
    .select("*, pulse_responses(*)")
    .eq("workspace_id", profile?.workspace_id)
    .order("week_start", { ascending: false })
    .limit(8)

  // Calculate current alignment score
  const currentPulse = recentPulses?.[0]
  let currentScore = 75 // Default score
  let previousScore = 75

  if (currentPulse?.pulse_responses?.length) {
    const responses = currentPulse.pulse_responses
    const avgScores = responses.map(
      (r: {
        vision_score: number
        workload_score: number
        communication_score: number
        strategy_score: number
        wellbeing_score: number
      }) =>
        ((r.vision_score || 0) +
          (r.workload_score || 0) +
          (r.communication_score || 0) +
          (r.strategy_score || 0) +
          (r.wellbeing_score || 0)) /
        5,
    )
    currentScore = Math.round((avgScores.reduce((a: number, b: number) => a + b, 0) / avgScores.length) * 10)
  }

  if (recentPulses?.[1]?.pulse_responses?.length) {
    const responses = recentPulses[1].pulse_responses
    const avgScores = responses.map(
      (r: {
        vision_score: number
        workload_score: number
        communication_score: number
        strategy_score: number
        wellbeing_score: number
      }) =>
        ((r.vision_score || 0) +
          (r.workload_score || 0) +
          (r.communication_score || 0) +
          (r.strategy_score || 0) +
          (r.wellbeing_score || 0)) /
        5,
    )
    previousScore = Math.round((avgScores.reduce((a: number, b: number) => a + b, 0) / avgScores.length) * 10)
  }

  const scoreDrop = previousScore - currentScore
  const showEmergencyBanner = currentScore < 50

  // Get action items
  const { data: actionItems } = await supabase
    .from("action_items")
    .select("*")
    .eq("workspace_id", profile?.workspace_id)
    .neq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5)

  // Prepare chart data
  const chartData = (recentPulses || []).reverse().map(
    (pulse: {
      week_start: string
      pulse_responses: Array<{
        vision_score: number
        workload_score: number
        communication_score: number
        strategy_score: number
        wellbeing_score: number
      }>
    }) => {
      if (!pulse.pulse_responses?.length) {
        return {
          week: new Date(pulse.week_start).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          score: 0,
          vision: 0,
          workload: 0,
          communication: 0,
          strategy: 0,
          wellbeing: 0,
        }
      }
      const responses = pulse.pulse_responses
      const avgScore =
        responses.reduce(
          (
            acc: number,
            r: {
              vision_score: number
              workload_score: number
              communication_score: number
              strategy_score: number
              wellbeing_score: number
            },
          ) => {
            return (
              acc +
              (r.vision_score + r.workload_score + r.communication_score + r.strategy_score + r.wellbeing_score) / 5
            )
          },
          0,
        ) / responses.length

      return {
        week: new Date(pulse.week_start).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: Math.round(avgScore * 10),
        vision: Math.round(
          (responses.reduce((a: number, r: { vision_score: number }) => a + r.vision_score, 0) / responses.length) * 10,
        ),
        workload: Math.round(
          (responses.reduce((a: number, r: { workload_score: number }) => a + r.workload_score, 0) / responses.length) *
            10,
        ),
        communication: Math.round(
          (responses.reduce((a: number, r: { communication_score: number }) => a + r.communication_score, 0) /
            responses.length) *
            10,
        ),
        strategy: Math.round(
          (responses.reduce((a: number, r: { strategy_score: number }) => a + r.strategy_score, 0) / responses.length) *
            10,
        ),
        wellbeing: Math.round(
          (responses.reduce((a: number, r: { wellbeing_score: number }) => a + r.wellbeing_score, 0) /
            responses.length) *
            10,
        ),
      }
    },
  )

  return (
    <div className="space-y-6">
      {/* Emergency Call Banner */}
      {showEmergencyBanner && <EmergencyCallBanner alignmentScore={currentScore} workspaceId={profile?.workspace_id} />}

      {/* Score Drop Warning */}
      {scoreDrop >= 20 && !showEmergencyBanner && (
        <div className="rounded-lg border border-warning bg-warning/10 p-4">
          <p className="font-medium text-warning-foreground">
            Warning: Alignment score dropped {scoreDrop} points this week
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Consider scheduling a co-founder sync to discuss any concerns.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AlignmentScoreCard score={currentScore} previousScore={previousScore} />
        <PulseStatus
          pulse={currentPulse}
          totalCoFounders={2}
          submittedCount={currentPulse?.pulse_responses?.length || 0}
        />
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <a
              href="/dashboard/pulse"
              className="block rounded-lg bg-primary/10 p-3 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              Complete Weekly Pulse
            </a>
            <a
              href="/dashboard/actions"
              className="block rounded-lg bg-secondary p-3 text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              View Action Items ({actionItems?.length || 0})
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AlignmentChart data={chartData} />
        <RecentFeedback pulses={recentPulses || []} />
      </div>

      <ActionItemsList items={actionItems || []} />
    </div>
  )
}
