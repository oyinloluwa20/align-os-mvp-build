"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AlertTriangle, Clock, FileText, Phone, Sparkles, Copy, Check } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface EmergencyCall {
  id: string
  alignment_score: number
  mediation_script: string | null
  agenda: {
    items: Array<{
      title: string
      duration: string
      description: string
    }>
  } | null
  status: string
  created_at: string
}

export default function EmergencyCallPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [emergencyCall, setEmergencyCall] = useState<EmergencyCall | null>(null)
  const [context, setContext] = useState("")
  const [alignmentScore, setAlignmentScore] = useState(45)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadExistingCall()
    loadAlignmentScore()
  }, [])

  const loadAlignmentScore = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from("profiles").select("workspace_id").eq("id", user.id).single()

    if (!profile?.workspace_id) return

    const { data: pulses } = await supabase
      .from("pulses")
      .select("*, pulse_responses(*)")
      .eq("workspace_id", profile.workspace_id)
      .eq("status", "completed")
      .order("week_start", { ascending: false })
      .limit(1)

    if (pulses?.[0]?.pulse_responses?.length) {
      const responses = pulses[0].pulse_responses
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
      const score = Math.round((avgScores.reduce((a: number, b: number) => a + b, 0) / avgScores.length) * 10)
      setAlignmentScore(score)
    }
  }

  const loadExistingCall = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from("profiles").select("workspace_id").eq("id", user.id).single()

    if (!profile?.workspace_id) return

    const { data } = await supabase
      .from("emergency_calls")
      .select("*")
      .eq("workspace_id", profile.workspace_id)
      .order("created_at", { ascending: false })
      .limit(1)

    if (data?.[0]) {
      setEmergencyCall(data[0])
    }
  }

  const generateScript = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/emergency-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alignmentScore,
          context,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate script")
      }

      const data = await response.json()
      setEmergencyCall(data.emergencyCall)
      toast.success("Emergency call script generated!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate script")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10">
            <Phone className="h-5 w-5 text-danger" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Emergency Alignment Call</h1>
            <p className="text-muted-foreground">
              Generate a professional mediation script for difficult conversations
            </p>
          </div>
        </div>
      </div>

      {/* Score Warning */}
      {alignmentScore < 50 && (
        <div className="mb-6 rounded-xl border-2 border-danger bg-danger/10 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <span className="font-medium text-danger">Current Alignment Score: {alignmentScore}/100</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Your alignment score indicates serious concerns. This tool will help you have a structured, productive
            conversation with your co-founders.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Generator Form */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate New Script
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Additional Context (Optional)</Label>
              <Textarea
                className="mt-2"
                placeholder="Describe any specific issues or concerns you want to address..."
                rows={4}
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">This helps the AI generate a more relevant script</p>
            </div>
            <Button className="w-full gap-2" onClick={generateScript} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Generating Script...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Mediation Script
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Previous Calls */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Scripts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emergencyCall ? (
              <div className="space-y-3">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Score: {emergencyCall.alignment_score}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(emergencyCall.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {emergencyCall.status === "generated"
                      ? "Script ready"
                      : emergencyCall.status === "scheduled"
                        ? "Call scheduled"
                        : "Completed"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No previous scripts generated</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generated Script */}
      {emergencyCall?.mediation_script && (
        <div className="mt-6 space-y-6">
          {/* Agenda */}
          {emergencyCall.agenda?.items && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Meeting Agenda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyCall.agenda.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{item.title}</h4>
                          <span className="text-sm text-muted-foreground">{item.duration}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mediation Script */}
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Mediation Script
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => copyToClipboard(emergencyCall.mediation_script || "")}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm">
                  {emergencyCall.mediation_script}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
