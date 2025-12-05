"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Copy, Check, Users, Mail } from "lucide-react"
import type { Profile, Workspace } from "@/lib/types"

export default function TeamPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<Profile[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTeam()
  }, [])

  const loadTeam = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, workspace:workspaces(*)")
      .eq("id", user.id)
      .single()

    if (profile?.workspace) {
      setWorkspace(profile.workspace as Workspace)

      const { data: profiles } = await supabase.from("profiles").select("*").eq("workspace_id", profile.workspace_id)

      setMembers(profiles || [])
    }
    setIsLoading(false)
  }

  const copyInviteLink = async () => {
    if (!workspace?.invite_code) return
    const link = `${window.location.origin}/auth/sign-up?invite=${workspace.invite_code}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success("Invite link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return
    // In production, this would send an email via Resend
    toast.success(`Invite would be sent to ${inviteEmail}`)
    setInviteEmail("")
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="mt-1 text-muted-foreground">Manage your co-founders and invite new members</p>
      </div>

      {/* Invite Section */}
      <Card className="glass mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Co-founders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Magic Link */}
          <div>
            <Label>Share Invite Link</Label>
            <div className="mt-2 flex gap-2">
              <Input
                readOnly
                value={
                  workspace?.invite_code
                    ? `${typeof window !== "undefined" ? window.location.origin : ""}/auth/sign-up?invite=${workspace.invite_code}`
                    : "Loading..."
                }
                className="font-mono text-sm"
              />
              <Button variant="outline" className="gap-2 bg-transparent" onClick={copyInviteLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Anyone with this link can join your workspace</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Email Invite */}
          <div>
            <Label>Send Email Invite</Label>
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="cofounder@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={sendInvite}>Send Invite</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Team Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-4 rounded-lg border p-4">
                <Avatar>
                  <AvatarFallback>{getInitials(member.full_name, member.email)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{member.full_name || member.email}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
