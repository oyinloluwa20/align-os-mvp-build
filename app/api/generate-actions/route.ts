import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("workspace_id").eq("id", user.id).single()

    if (!profile?.workspace_id) {
      return Response.json({ error: "No workspace found" }, { status: 400 })
    }

    // Get recent feedback
    const { data: recentPulses } = await supabase
      .from("pulses")
      .select("*, pulse_responses(*)")
      .eq("workspace_id", profile.workspace_id)
      .eq("status", "completed")
      .order("week_start", { ascending: false })
      .limit(4)

    const feedback =
      recentPulses
        ?.flatMap((p) =>
          p.pulse_responses?.map((r: { open_feedback: string | null }) => r.open_feedback).filter(Boolean),
        )
        .slice(0, 10) || []

    if (feedback.length === 0) {
      return Response.json({ items: [] })
    }

    const prompt = `Based on the following co-founder feedback, suggest 3-5 specific, actionable items that could improve team alignment. Each item should be concrete and achievable within 1-2 weeks.

Feedback:
${feedback.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Return a JSON array of objects with "title" and "description" fields. Example:
[
  {"title": "Schedule weekly 1:1 sync", "description": "Set up a recurring 30-minute call every Tuesday to discuss priorities"},
  {"title": "Document role responsibilities", "description": "Create a shared document outlining each co-founder's key areas"}
]

Return ONLY the JSON array, no other text.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      maxOutputTokens: 1000,
      temperature: 0.7,
    })

    // Parse the response
    let suggestions = []
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/m)
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0])
      }
    } catch {
      console.error("Failed to parse AI response")
      return Response.json({ items: [] })
    }

    // Save to database
    const itemsToInsert = suggestions.map((s: { title: string; description?: string }) => ({
      workspace_id: profile.workspace_id,
      title: s.title,
      description: s.description || null,
      status: "suggested",
      ai_generated: true,
    }))

    const { data: items, error } = await supabase.from("action_items").insert(itemsToInsert).select()

    if (error) throw error

    return Response.json({ items })
  } catch (error) {
    console.error("Generate actions error:", error)
    return Response.json({ error: "Failed to generate action items" }, { status: 500 })
  }
}
