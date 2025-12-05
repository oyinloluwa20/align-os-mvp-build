"use client"

import { CheckCircle2, Circle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ActionItem } from "@/lib/types"

interface ActionItemsListProps {
  items: ActionItem[]
}

export function ActionItemsList({ items }: ActionItemsListProps) {
  // Sample items if no data
  const displayItems: ActionItem[] =
    items.length > 0
      ? items
      : [
          {
            id: "1",
            workspace_id: "",
            pulse_id: null,
            title: "Schedule weekly 1:1 sync",
            description: "Set up a recurring 30-min call every Tuesday",
            assignee_id: null,
            status: "committed",
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            ai_generated: true,
            created_at: new Date().toISOString(),
            completed_at: null,
          },
          {
            id: "2",
            workspace_id: "",
            pulse_id: null,
            title: "Document role responsibilities",
            description: "Create a shared doc outlining each co-founder's areas",
            assignee_id: null,
            status: "in_progress",
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            ai_generated: true,
            created_at: new Date().toISOString(),
            completed_at: null,
          },
          {
            id: "3",
            workspace_id: "",
            pulse_id: null,
            title: "Review equity split conversation",
            description: "Revisit the vesting schedule discussion",
            assignee_id: null,
            status: "suggested",
            due_date: null,
            ai_generated: true,
            created_at: new Date().toISOString(),
            completed_at: null,
          },
        ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-warning" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Action Items</h3>
          <p className="mt-1 text-sm text-muted-foreground">Tasks to improve alignment</p>
        </div>
        <Link href="/dashboard/actions">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {displayItems.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
            {getStatusIcon(item.status)}
            <div className="flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              {item.description && <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>}
              <div className="mt-2 flex items-center gap-2">
                {item.ai_generated && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">AI Suggested</span>
                )}
                {item.due_date && (
                  <span className="text-xs text-muted-foreground">
                    Due {new Date(item.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
