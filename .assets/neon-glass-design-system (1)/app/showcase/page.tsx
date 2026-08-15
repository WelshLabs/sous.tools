import { AuroraBackground } from "@/components/aurora-background"
import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/showcase/hero"
import { Foundations } from "@/components/showcase/foundations"
import { Components } from "@/components/showcase/components"
import { Loaders } from "@/components/showcase/loaders"
import { MicroIcon } from "@/components/logo"

export default function Page() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <AuroraBackground fixed />
      <div className="relative z-10">
        <SiteHeader />
        <main>
          <Hero />
          <Foundations />
          <Components />
          <Loaders />
        </main>
        <footer className="mx-auto max-w-6xl px-5 py-12">
          <div className="ds-glass flex flex-col items-center gap-3 rounded-[var(--radius-lg)] px-6 py-8 text-center">
            <MicroIcon className="h-8 w-8 text-primary" />
            <p className="font-display text-sm font-medium text-foreground">
              <span className="font-bold">sous</span>
              <span className="font-mono text-muted-foreground">.tools</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Neon-glass design system — React, Tailwind v4, Framer Motion.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
