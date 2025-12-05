"use client"

import { AlertTriangle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmergencyCallBannerProps {
  alignmentScore: number
  workspaceId: string
}

export function EmergencyCallBanner({ alignmentScore }: EmergencyCallBannerProps) {
  return (
    <div className="rounded-xl border-2 border-danger bg-danger/10 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/20">
          <AlertTriangle className="h-5 w-5 text-danger" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-danger">Critical: Alignment Score Below 50</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your alignment score is {alignmentScore}. This indicates serious concerns that need immediate attention. We
            recommend scheduling an emergency alignment call with your co-founders.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard/emergency">
              <Button className="gap-2 bg-danger text-danger-foreground hover:bg-danger/90">
                <Phone className="h-4 w-4" />
                Generate Emergency Call Script
              </Button>
            </Link>
            <Button variant="outline">Schedule Therapist Session</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
