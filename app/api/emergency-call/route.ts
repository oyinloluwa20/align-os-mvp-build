import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { alignmentScore, context } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("workspace_id, full_name, workspace:workspaces(name)")
      .eq("id", user.id)
      .single()

    if (!profile?.workspace_id) {
      return Response.json({ error: "No workspace found" }, { status: 400 })
    }

    // Get recent pulse data for context
    const { data: recentPulses } = await supabase
      .from("pulses")
      .select("*, pulse_responses(*)")
      .eq("workspace_id", profile.workspace_id)
      .eq("status", "completed")
      .order("week_start", { ascending: false })
      .limit(4)

    // Extract feedback themes
    const recentFeedback =
      recentPulses
        ?.flatMap((p) =>
          p.pulse_responses?.map((r: { open_feedback: string | null }) => r.open_feedback).filter(Boolean),
        )
        .slice(0, 10)
        .join("\n- ") || "No recent feedback available"

    // Generate the mediation script using GPT-4o
    const prompt = `You are an expert startup co-founder mediator and therapist. Generate a professional, neutral mediation script and meeting agenda for a co-founder alignment call.

CONTEXT:
- Current Alignment Score: ${alignmentScore}/100 (below 50 is critical)
- Company: ${(profile.workspace as { name?: string })?.name || "Startup"}
- Additional context from the co-founder: ${context || "None provided"}
- Recent anonymous feedback themes:
${recentFeedback ? `- ${recentFeedback}` : "- No feedback available"}

REQUIREMENTS:
1. The script must be neutral and not take sides
2. Focus on understanding perspectives, not assigning blame
3. Include specific talking points and suggested phrases
4. Create a structured agenda with time allocations
5. Include de-escalation techniques
6. End with concrete next steps and commitments

Generate the following:

AGENDA (format as JSON array):
Create 5-6 agenda items with title, duration (e.g., "10 mins"), and description.

MEDIATION SCRIPT:
Write a detailed script that a neutral party could use to facilitate the conversation. Include:
- Opening statement to set the tone
- Ground rules for the discussion
- Key questions to ask each co-founder
- Reflective listening prompts
- De-escalation phrases if tensions rise
- Summary and commitment section
- Closing remarks

Make it professional, empathetic, and actionable. The goal is to rebuild trust and improve alignment.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 3000,
      temperature: 0.7,
    })

    // Parse the response to extract agenda and script
    let agenda = { items: [] as Array<{ title: string; duration: string; description: string }> }
    let mediationScript = text

    // Try to extract JSON agenda from the response
    const jsonMatch = text.match(/\[[\s\S]*?\]/m)
    if (jsonMatch) {
      try {
        const parsedAgenda = JSON.parse(jsonMatch[0])
        agenda = { items: parsedAgenda }
        // Remove the JSON from the script
        mediationScript = text.replace(jsonMatch[0], "").trim()
      } catch {
        // If JSON parsing fails, create a default agenda
        agenda = {
          items: [
            {
              title: "Opening & Ground Rules",
              duration: "5 mins",
              description: "Set the tone and establish guidelines for respectful dialogue",
            },
            {
              title: "Individual Perspectives",
              duration: "15 mins",
              description: "Each co-founder shares their perspective without interruption",
            },
            {
              title: "Core Issues Discussion",
              duration: "20 mins",
              description: "Identify and discuss the main areas of misalignment",
            },
            { title: "Finding Common Ground", duration: "15 mins", description: "Explore shared values and goals" },
            { title: "Action Items & Commitments", duration: "10 mins", description: "Agree on concrete next steps" },
            { title: "Closing & Check-in Schedule", duration: "5 mins", description: "Summarize and plan follow-up" },
          ],
        }
      }
    }

    // Clean up the script
    mediationScript = mediationScript
      .replace(/AGENDA.*?MEDIATION SCRIPT:/s, "")
      .replace(/^MEDIATION SCRIPT:?\s*/i, "")
      .trim()

    // Save to database
    const { data: emergencyCall, error } = await supabase
      .from("emergency_calls")
      .insert({
        workspace_id: profile.workspace_id,
        triggered_by: user.id,
        alignment_score: alignmentScore,
        mediation_script: mediationScript,
        agenda,
        status: "generated",
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ emergencyCall })
  } catch (error) {
    console.error("Emergency call generation error:", error)
    return Response.json({ error: "Failed to generate emergency call script" }, { status: 500 })
  }
}
