"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { CreditCard, Building, User } from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = useState<{
    full_name: string | null
    email: string
    workspace?: { name: string; plan: string; subscription_status: string }
  } | null>(null)
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from("profiles").select("*, workspace:workspaces(*)").eq("id", user.id).single()

    if (data) {
      setProfile(data)
      setFullName(data.full_name || "")
      setCompanyName(data.workspace?.name || "")
    }
    setIsLoading(false)
  }

  const saveProfile = async () => {
    setIsSaving(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id)

    if (error) {
      toast.error("Failed to save profile")
    } else {
      toast.success("Profile saved")
    }
    setIsSaving(false)
  }

  const openBillingPortal = async () => {
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      })
      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to open billing portal")
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account and workspace settings</p>
      </div>

      {/* Profile Settings */}
      <Card className="glass mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email || ""} disabled className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <Button onClick={saveProfile} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Workspace Settings */}
      <Card className="glass mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Workspace
          </CardTitle>
          <CardDescription>Your company workspace settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-2"
            />
          </div>
          <Button variant="outline">Update Workspace</Button>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing
          </CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{profile?.workspace?.plan === "pro" ? "Pro Plan" : "Starter Plan"}</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.workspace?.plan === "pro" ? "$179/month" : "$99/month"}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  profile?.workspace?.subscription_status === "active"
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {profile?.workspace?.subscription_status || "trialing"}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={openBillingPortal}>Manage Subscription</Button>
            {profile?.workspace?.plan !== "pro" && <Button variant="outline">Upgrade to Pro</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
