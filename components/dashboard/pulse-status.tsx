"use client"

import { Activity, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Pulse } from "@/lib/types"

interface PulseStatusProps {
  pulse: Pulse | null | undefined
  totalCoFounders: number
  submittedCount: number
}

export function PulseStatus({ pulse, totalCoFounders, submittedCount }: PulseStatusProps) {
  const isComplete = pulse?.status === "completed"
  const isPending = !pulse || pulse.status === "pending"

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Weekly Pulse</h3>
      </div>
      <div className="mt-4">
        {isComplete ? (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Completed</span>
          </div>
        ) : isPending ? (
          <div className="flex items-center gap-2 text-warning">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Awaiting Responses</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span className="font-medium">
              {submittedCount}/{totalCoFounders} submitted
            </span>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {isComplete
          ? "All co-founders have submitted. View results on the dashboard."
          : "Complete your weekly alignment check-in to see results."}
      </p>
      {!isComplete && (
        <Link href="/dashboard/pulse" className="mt-4 block">
          <Button className="w-full">Complete Pulse</Button>
        </Link>
      )}
    </div>
  )
}
