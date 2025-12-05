import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("workspace:workspaces(stripe_customer_id)")
      .eq("id", user.id)
      .single()

    const workspace = profile?.workspace as { stripe_customer_id?: string } | null

    if (!workspace?.stripe_customer_id) {
      return Response.json({ error: "No billing account" }, { status: 400 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: workspace.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/settings`,
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error("Billing portal error:", error)
    return Response.json({ error: "Failed to create billing portal session" }, { status: 500 })
  }
}
