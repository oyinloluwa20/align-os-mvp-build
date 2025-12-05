-- AlignOS Database Schema
-- Creates all tables for the co-founder alignment platform

-- Workspaces (companies)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'trialing',
  plan TEXT DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (co-founders)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'cofounder',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pulse Surveys (weekly check-ins)
CREATE TABLE IF NOT EXISTS pulses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, partial, completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(workspace_id, week_start)
);

-- Pulse Responses (individual co-founder responses)
CREATE TABLE IF NOT EXISTS pulse_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pulse_id UUID NOT NULL REFERENCES pulses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vision_score INTEGER CHECK (vision_score >= 1 AND vision_score <= 10),
  workload_score INTEGER CHECK (workload_score >= 1 AND workload_score <= 10),
  communication_score INTEGER CHECK (communication_score >= 1 AND communication_score <= 10),
  strategy_score INTEGER CHECK (strategy_score >= 1 AND strategy_score <= 10),
  wellbeing_score INTEGER CHECK (wellbeing_score >= 1 AND wellbeing_score <= 10),
  open_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pulse_id, user_id)
);

-- Action Items (derived from feedback)
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  pulse_id UUID REFERENCES pulses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'suggested', -- suggested, committed, in_progress, completed
  due_date DATE,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Emergency Alignment Calls
CREATE TABLE IF NOT EXISTS emergency_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  triggered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  alignment_score INTEGER NOT NULL,
  mediation_script TEXT,
  agenda JSONB,
  status TEXT DEFAULT 'generated', -- generated, scheduled, completed
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  risk_areas JSONB,
  compatibility_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
CREATE POLICY "Users can view their own workspace"
  ON workspaces FOR SELECT
  USING (id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can update their own workspace"
  ON workspaces FOR UPDATE
  USING (id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their workspace"
  ON profiles FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- RLS Policies for pulses
CREATE POLICY "Users can view pulses in their workspace"
  ON pulses FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can insert pulses in their workspace"
  ON pulses FOR INSERT
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can update pulses in their workspace"
  ON pulses FOR UPDATE
  USING (workspace_id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid()));

-- RLS Policies for pulse_responses
CREATE POLICY "Users can view pulse responses after all submitted"
  ON pulse_responses FOR SELECT
  USING (
    pulse_id IN (
      SELECT p.id FROM pulses p
      WHERE p.status = 'completed'
      AND p.workspace_id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid())
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can insert their own pulse response"
  ON pulse_responses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pulse response"
  ON pulse_responses FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for action_items
CREATE POLICY "Users can view action items in their workspace"
  ON action_items FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can insert action items in their workspace"
  ON action_items FOR INSERT
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can update action items in their workspace"
  ON action_items FOR UPDATE
  USING (workspace_id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid()));

-- RLS Policies for emergency_calls
CREATE POLICY "Users can view emergency calls in their workspace"
  ON emergency_calls FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can insert emergency calls in their workspace"
  ON emergency_calls FOR INSERT
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid()));

-- RLS Policies for assessments
CREATE POLICY "Users can view assessments in their workspace"
  ON assessments FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can insert their own assessment"
  ON assessments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_workspace ON profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pulses_workspace ON pulses(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pulse_responses_pulse ON pulse_responses(pulse_id);
CREATE INDEX IF NOT EXISTS idx_action_items_workspace ON action_items(workspace_id);
CREATE INDEX IF NOT EXISTS idx_emergency_calls_workspace ON emergency_calls(workspace_id);
