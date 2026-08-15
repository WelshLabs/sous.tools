"use client"

import { useState } from "react"
import { Mail, Lock, Search, Heart, Star, Zap } from "lucide-react"
import { Section, SubLabel } from "./section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Input } from "@/components/ui/input"
import { MicroIcon, Lettermark, PrimaryLogo } from "@/components/logo"

const filters = ["Recipes", "Techniques", "Plating", "Pairings"]

export function Components() {
  const [selected, setSelected] = useState<string[]>(["Recipes"])
  const [tags, setTags] = useState(["braise", "sear", "sous-vide"])

  function toggle(f: string) {
    setSelected((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  }

  return (
    <Section
      id="components"
      eyebrow="Components"
      title="Components that feel alive"
      description="Rebuilt from scratch on React + Framer Motion. Subtle spring physics, a sheen sweep on buttons, animated selection, and floating-label inputs with a neon underline."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Buttons */}
        <Card>
          <SubLabel>Buttons</SubLabel>
          <div className="flex flex-wrap gap-3">
            <Button variant="gradient">Gradient</Button>
            <Button variant="primary">Primary</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button size="sm" variant="gradient">
              <Zap className="h-4 w-4" />
              Small
            </Button>
            <Button size="md" variant="gradient">
              Medium
            </Button>
            <Button size="lg" variant="gradient">
              Large
            </Button>
            <Button size="icon" variant="glass" aria-label="Favorite">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Chips */}
        <Card>
          <SubLabel>Filter chips</SubLabel>
          <div className="flex flex-wrap gap-2.5">
            {filters.map((f) => (
              <Chip key={f} selected={selected.includes(f)} onClick={() => toggle(f)}>
                {f}
              </Chip>
            ))}
          </div>
          <SubLabel>Input chips (removable)</SubLabel>
          <div className="flex flex-wrap gap-2.5">
            {tags.map((t) => (
              <Chip
                key={t}
                icon={<Star className="h-3.5 w-3.5" />}
                onRemove={() => setTags((prev) => prev.filter((x) => x !== t))}
              >
                {t}
              </Chip>
            ))}
            {tags.length === 0 && <span className="text-sm text-muted-foreground">All removed — nice.</span>}
          </div>
        </Card>

        {/* Inputs */}
        <Card className="lg:col-span-2">
          <SubLabel>Form inputs</SubLabel>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Email" type="email" icon={<Mail className="h-4 w-4" />} hint="We'll never share it." />
            <Input label="Password" type="password" icon={<Lock className="h-4 w-4" />} />
            <Input label="Search" placeholder="Try 'confit'..." icon={<Search className="h-4 w-4" />} />
            <Input label="Username" error="That handle is taken." defaultValue="chef" />
          </div>
        </Card>

        {/* Logos */}
        <Card className="lg:col-span-2">
          <SubLabel>Logo suite — themeable via color</SubLabel>
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <PrimaryLogo className="h-9 w-auto text-foreground" />
              <span className="font-mono text-xs text-muted-foreground">PrimaryLogo</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <PrimaryLogo gradient className="h-9 w-auto" />
              <span className="font-mono text-xs text-muted-foreground">gradient</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Lettermark className="h-11 w-11 text-primary" />
              <span className="font-mono text-xs text-muted-foreground">Lettermark</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MicroIcon className="h-9 w-9 text-accent" />
              <span className="font-mono text-xs text-muted-foreground">MicroIcon</span>
            </div>
            {/* Arbitrary colors: just set text color */}
            <div className="flex items-center gap-3">
              <MicroIcon className="h-8 w-8" style={{ color: "#f43f5e" }} />
              <MicroIcon className="h-8 w-8" style={{ color: "#f59e0b" }} />
              <MicroIcon className="h-8 w-8" style={{ color: "#10b981" }} />
            </div>
          </div>
        </Card>
      </div>
    </Section>
  )
}
