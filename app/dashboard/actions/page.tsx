"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { CheckCircle2, Circle, Clock, Plus, Sparkles, Trash2 } from "lucide-react"
import type { ActionItem } from "@/lib/types"

export default function ActionsPage() {
  const [items, setItems] = useState<ActionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newItemTitle, setNewItemTitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from("profiles").select("workspace_id").eq("id", user.id).single()

    if (!profile?.workspace_id) return

    const { data } = await supabase
      .from("action_items")
      .select("*")
      .eq("workspace_id", profile.workspace_id)
      .order("created_at", { ascending: false })

    setItems(data || [])
    setIsLoading(false)
  }

  const addItem = async () => {
    if (!newItemTitle.trim()) return

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from("profiles").select("workspace_id").eq("id", user.id).single()

    if (!profile?.workspace_id) return

    const { data, error } = await supabase
      .from("action_items")
      .insert({
        workspace_id: profile.workspace_id,
        title: newItemTitle,
        status: "committed",
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to add action item")
      return
    }

    setItems([data, ...items])
    setNewItemTitle("")
    toast.success("Action item added")
  }

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()

    const updates: { status: string; completed_at?: string | null } = { status }
    if (status === "completed") {
      updates.completed_at = new Date().toISOString()
    } else {
      updates.completed_at = null
    }

    const { error } = await supabase.from("action_items").update(updates).eq("id", id)

    if (error) {
      toast.error("Failed to update status")
      return
    }

    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const deleteItem = async (id: string) => {
    const supabase = createClient()

    const { error } = await supabase.from("action_items").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete item")
      return
    }

    setItems(items.filter((item) => item.id !== id))
    toast.success("Action item deleted")
  }

  const generateAIItems = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-actions", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to generate")

      const { items: newItems } = await response.json()
      setItems([...newItems, ...items])
      toast.success(`Generated ${newItems.length} action items`)
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate action items")
    } finally {
      setIsGenerating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-warning" />
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const pendingItems = items.filter((i) => i.status !== "completed")
  const completedItems = items.filter((i) => i.status === "completed")

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Action Items</h1>
          <p className="mt-1 text-muted-foreground">Track commitments to improve alignment</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent" onClick={generateAIItems} disabled={isGenerating}>
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate from Feedback"}
        </Button>
      </div>

      {/* Add New Item */}
      <Card className="glass mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="newItem" className="sr-only">
                New action item
              </Label>
              <Input
                id="newItem"
                placeholder="Add a new action item..."
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
              />
            </div>
            <Button onClick={addItem} className="gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Items */}
      <Card className="glass mb-6">
        <CardHeader>
          <CardTitle>Pending ({pendingItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : pendingItems.length === 0 ? (
            <p className="text-muted-foreground">No pending action items</p>
          ) : (
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border p-4">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
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
                  <div className="flex items-center gap-2">
                    <Select value={item.status} onValueChange={(value) => updateStatus(item.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suggested">Suggested</SelectItem>
                        <SelectItem value="committed">Committed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Completed ({completedItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-success/20 bg-success/5 p-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <div className="flex-1">
                    <p className="font-medium line-through opacity-70">{item.title}</p>
                    {item.completed_at && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Completed {new Date(item.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
