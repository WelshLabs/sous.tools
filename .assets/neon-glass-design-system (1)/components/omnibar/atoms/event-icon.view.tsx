import { Bot, Check, FileCheck2, Gauge, Sparkles, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OmnibarEvent } from "@/lib/omnibar/types"

export function EventIconView({ type }: { type: OmnibarEvent["type"] }) {
  const Icon = type === "user" ? UserRound : type === "activity" ? Sparkles : type === "metrics" ? Gauge : type === "change" ? Check : type === "ingestion" || type === "uploads" ? FileCheck2 : Bot
  return (
    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground", type === "agent" && "border-primary/25 text-primary")}>
      <Icon className="h-4 w-4" />
    </span>
  )
}
