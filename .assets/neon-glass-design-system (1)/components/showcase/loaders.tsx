"use client"

import { useEffect, useState } from "react"
import { Section, SubLabel } from "./section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BrandLoader, Spinner, DotsLoader, ProgressBar } from "@/components/ui/loader"
import { TopProgress } from "@/components/ui/top-progress"

export function Loaders() {
  const [progress, setProgress] = useState(30)
  const [routeLoading, setRouteLoading] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 10))
    }, 900)
    return () => clearInterval(id)
  }, [])

  function simulateRoute() {
    setRouteLoading(true)
    setTimeout(() => setRouteLoading(false), 2200)
  }

  return (
    <Section
      id="loaders"
      eyebrow="Progress"
      title="Loaders with personality"
      description="The brand loader draws the sous.tools mark stroke-by-stroke — a first-class progress option alongside the classic spinner, dots, and bar."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="items-center">
          <SubLabel>Brand mark</SubLabel>
          <div className="flex flex-1 items-center justify-center py-4">
            <BrandLoader size="lg" />
          </div>
        </Card>
        <Card className="items-center">
          <SubLabel>Spinner</SubLabel>
          <div className="flex flex-1 items-center justify-center py-4">
            <Spinner size="lg" />
          </div>
        </Card>
        <Card className="items-center">
          <SubLabel>Dots</SubLabel>
          <div className="flex flex-1 items-center justify-center py-4">
            <DotsLoader />
          </div>
        </Card>
        <Card className="items-center">
          <SubLabel>Mark sizes</SubLabel>
          <div className="flex flex-1 items-center justify-center gap-3 py-4">
            <BrandLoader size="sm" />
            <BrandLoader size="md" />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <SubLabel>Determinate</SubLabel>
          <div className="flex flex-col gap-3 pt-2">
            <ProgressBar value={progress} />
            <span className="font-mono text-xs text-muted-foreground">{progress}%</span>
          </div>
        </Card>
        <Card>
          <SubLabel>Indeterminate</SubLabel>
          <div className="pt-2">
            <ProgressBar />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="relative overflow-hidden">
          {/* Pinned to this card for the demo; in-app it pins to the viewport. */}
          <TopProgress active={routeLoading} absolute />
          <SubLabel>Top bar (NProgress-style)</SubLabel>
          <div className="flex flex-col items-start gap-4 pt-2">
            <p className="text-sm text-muted-foreground">
              A slim neon bar that trickles toward the top edge during navigation, then snaps to 100% and fades.
              Trigger a mock page load to watch it run along the top of this card.
            </p>
            <Button variant="outline" size="sm" onClick={simulateRoute} disabled={routeLoading}>
              {routeLoading ? "Loading…" : "Simulate page load"}
            </Button>
          </div>
        </Card>
      </div>
    </Section>
  )
}
