"use client"

import { Section, SubLabel } from "./section"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const colorRoles = [
  { name: "background", fg: "foreground" },
  { name: "card", fg: "card-foreground" },
  { name: "primary", fg: "primary-foreground" },
  { name: "secondary", fg: "secondary-foreground" },
  { name: "accent", fg: "accent-foreground" },
  { name: "violet", fg: "violet-foreground" },
  { name: "muted", fg: "muted-foreground" },
  { name: "destructive", fg: "destructive-foreground" },
  { name: "success", fg: "success-foreground" },
  { name: "warning", fg: "warning-foreground" },
]

const typeScale = [
  { cls: "font-display text-5xl font-bold tracking-tight", label: "Display / Space Grotesk 700", sample: "Mise en place" },
  { cls: "font-display text-3xl font-semibold tracking-tight", label: "Heading / Space Grotesk 600", sample: "Sharpen the knives" },
  { cls: "font-sans text-xl font-medium", label: "Title / Inter 500", sample: "Balanced acidity and heat" },
  { cls: "font-sans text-base", label: "Body / Inter 400", sample: "Season in layers, taste as you go, and never crowd the pan." },
  { cls: "font-sans text-sm text-muted-foreground", label: "Caption / Inter 400", sample: "Serves four. Prep twenty minutes." },
  { cls: "font-mono text-sm", label: "Mono / JetBrains Mono", sample: "const heat = simmer(0.4)" },
]

const radii = [
  { name: "sm", cls: "rounded-[var(--radius-sm)]" },
  { name: "md", cls: "rounded-[var(--radius-md)]" },
  { name: "lg", cls: "rounded-[var(--radius-lg)]" },
  { name: "xl", cls: "rounded-[var(--radius-xl)]" },
  { name: "full", cls: "rounded-full" },
]

const glows = [
  { name: "glow-sm", cls: "shadow-glow-sm" },
  { name: "glow", cls: "shadow-glow" },
  { name: "glow-lg", cls: "shadow-glow-lg" },
  { name: "glow-accent", cls: "shadow-glow-accent" },
]

export function Foundations() {
  return (
    <Section
      id="foundations"
      eyebrow="Foundations"
      title="Tokens, not hardcoded values"
      description="Every surface pulls from semantic CSS variables. Flip the theme and all of it re-tunes — colors, glass, and glow included."
    >
      {/* Color swatches */}
      <SubLabel>Color roles</SubLabel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {colorRoles.map((role) => (
          <div
            key={role.name}
            className="flex aspect-[4/3] flex-col justify-between rounded-[var(--radius-md)] border border-border p-3"
            style={{ backgroundColor: `var(--${role.name})`, color: `var(--${role.fg})` }}
          >
            <span className="font-mono text-xs opacity-90">--{role.name}</span>
            <span className="text-sm font-medium">Aa</span>
          </div>
        ))}
      </div>

      {/* Typography */}
      <div className="mt-12">
        <SubLabel>Typography</SubLabel>
        <Card className="flex flex-col gap-6">
          {typeScale.map((t) => (
            <div key={t.label} className="flex flex-col gap-1 border-b border-border/60 pb-5 last:border-0 last:pb-0">
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {t.label}
              </span>
              <span className={cn("text-foreground", t.cls)}>{t.sample}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Radii + Glow */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div>
          <SubLabel>Radius scale</SubLabel>
          <Card className="flex flex-wrap items-end gap-4">
            {radii.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div className={cn("h-16 w-16 border border-primary/40 bg-primary/15", r.cls)} />
                <span className="font-mono text-xs text-muted-foreground">{r.name}</span>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <SubLabel>Elevation / glow</SubLabel>
          <Card className="flex flex-wrap items-center gap-5">
            {glows.map((g) => (
              <div key={g.name} className="flex flex-col items-center gap-3">
                <div className={cn("h-16 w-16 rounded-[var(--radius-md)] bg-card", g.cls)} />
                <span className="font-mono text-xs text-muted-foreground">{g.name}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </Section>
  )
}
