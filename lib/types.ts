export interface Workspace {
  id: string
  name: string
  invite_code: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string
  plan: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  workspace_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Pulse {
  id: string
  workspace_id: string
  week_start: string
  status: "pending" | "partial" | "completed"
  created_at: string
  completed_at: string | null
}

export interface PulseResponse {
  id: string
  pulse_id: string
  user_id: string
  vision_score: number
  workload_score: number
  communication_score: number
  strategy_score: number
  wellbeing_score: number
  open_feedback: string | null
  submitted_at: string
}

export interface ActionItem {
  id: string
  workspace_id: string
  pulse_id: string | null
  title: string
  description: string | null
  assignee_id: string | null
  status: "suggested" | "committed" | "in_progress" | "completed"
  due_date: string | null
  ai_generated: boolean
  created_at: string
  completed_at: string | null
}

export interface EmergencyCall {
  id: string
  workspace_id: string
  triggered_by: string | null
  alignment_score: number
  mediation_script: string | null
  agenda: {
    items: Array<{
      title: string
      duration: string
      description: string
    }>
  } | null
  status: "generated" | "scheduled" | "completed"
  scheduled_at: string | null
  created_at: string
}

export interface AlignmentData {
  currentScore: number
  previousScore: number
  trend: "up" | "down" | "stable"
  weeklyScores: Array<{
    week: string
    score: number
    vision: number
    workload: number
    communication: number
    strategy: number
    wellbeing: number
  }>
}
