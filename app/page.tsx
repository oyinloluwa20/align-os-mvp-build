import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, TrendingUp, Users, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">AlignOS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
              Save your startup.
              <br />
              <span className="text-primary">Save your friendship.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
              65% of startups fail due to co-founder conflict. AlignOS helps you measure alignment weekly, catch issues
              early, and have the conversations that matter—before it's too late.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for founding teams</h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to maintain healthy co-founder relationships
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Alignment Score"
              description="Track your team's alignment with weekly pulse surveys and real-time dashboards"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Early Warning System"
              description="Get alerts when alignment drops, before small issues become big problems"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="AI Action Items"
              description="Turn feedback into concrete action items with AI-powered suggestions"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Emergency Mediation"
              description="Generate professional mediation scripts when you need to have tough conversations"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted-foreground">Invest in your founding team's health</p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:max-w-4xl lg:mx-auto">
            <PricingCard
              name="Starter"
              price="$99"
              description="For early-stage teams"
              features={[
                "Up to 4 co-founders",
                "Weekly alignment pulses",
                "Real-time dashboard",
                "AI action items",
                "Emergency call scripts",
              ]}
            />
            <PricingCard
              name="Pro"
              price="$179"
              description="For growing teams"
              features={[
                "Unlimited co-founders",
                "Everything in Starter",
                "Priority support",
                "Advanced analytics",
                "Therapist booking included",
              ]}
              highlighted
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="glass rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to align your team?</h2>
            <p className="mt-4 text-muted-foreground">Start your 14-day free trial. No credit card required.</p>
            <div className="mt-8">
              <Link href="/auth/sign-up">
                <Button size="lg" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <span className="text-xs font-bold text-primary-foreground">A</span>
              </div>
              <span className="font-semibold">AlignOS</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 AlignOS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
}: {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div className={`rounded-xl p-8 ${highlighted ? "bg-primary text-primary-foreground" : "glass"}`}>
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className={`mt-1 text-sm ${highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {description}
      </p>
      <div className="mt-4">
        <span className="text-4xl font-bold">{price}</span>
        <span className={`${highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>/month</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <svg
              className={`h-4 w-4 ${highlighted ? "text-primary-foreground" : "text-primary"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/auth/sign-up" className="mt-8 block">
        <Button
          className={`w-full ${highlighted ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90" : ""}`}
          variant={highlighted ? "secondary" : "default"}
        >
          Start Free Trial
        </Button>
      </Link>
    </div>
  )
}
