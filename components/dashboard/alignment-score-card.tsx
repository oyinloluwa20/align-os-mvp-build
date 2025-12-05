"use client"

import { TrendingDown, TrendingUp, Minus } from "lucide-react"

interface AlignmentScoreCardProps {
  score: number
  previousScore: number
}

export function AlignmentScoreCard({ score, previousScore }: AlignmentScoreCardProps) {
  const change = score - previousScore
  const trend = change > 0 ? "up" : change < 0 ? "down" : "stable"

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-success"
    if (score >= 50) return "text-warning"
    return "text-danger"
  }

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-success/10"
    if (score >= 50) return "bg-warning/10"
    return "bg-danger/10"
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Alignment Score</h3>
        <div
          className={`flex items-center gap-1 text-sm ${
            trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-muted-foreground"
          }`}
        >
          {trend === "up" && <TrendingUp className="h-4 w-4" />}
          {trend === "down" && <TrendingDown className="h-4 w-4" />}
          {trend === "stable" && <Minus className="h-4 w-4" />}
          <span>
            {change > 0 ? "+" : ""}
            {change}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="mb-1 text-muted-foreground">/100</span>
      </div>
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getScoreBg(score).replace("/10", "")}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {score >= 70
          ? "Your team is well aligned!"
          : score >= 50
            ? "Some areas need attention"
            : "Critical: Schedule a sync soon"}
      </p>
    </div>
  )
}
