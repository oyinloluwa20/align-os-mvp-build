"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AlignmentChartProps {
  data: Array<{
    week: string
    score: number
    vision: number
    workload: number
    communication: number
    strategy: number
    wellbeing: number
  }>
}

const chartConfig = {
  score: {
    label: "Overall",
    color: "var(--chart-1)",
  },
}

export function AlignmentChart({ data }: AlignmentChartProps) {
  // Use sample data if no data available
  const chartData =
    data.length > 0
      ? data
      : [
          { week: "Nov 4", score: 72, vision: 75, workload: 68, communication: 70, strategy: 74, wellbeing: 73 },
          { week: "Nov 11", score: 68, vision: 70, workload: 65, communication: 68, strategy: 72, wellbeing: 65 },
          { week: "Nov 18", score: 75, vision: 78, workload: 72, communication: 75, strategy: 76, wellbeing: 74 },
          { week: "Nov 25", score: 71, vision: 73, workload: 69, communication: 72, strategy: 70, wellbeing: 71 },
          { week: "Dec 2", score: 78, vision: 80, workload: 75, communication: 78, strategy: 79, wellbeing: 78 },
        ]

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="font-semibold">Alignment Trend</h3>
      <p className="mt-1 text-sm text-muted-foreground">Last 8 weeks of alignment scores</p>
      <div className="mt-4 h-64">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="score" stroke="var(--chart-1)" strokeWidth={2} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
