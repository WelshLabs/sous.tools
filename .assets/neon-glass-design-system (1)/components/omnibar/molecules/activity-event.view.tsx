import type { OmnibarEvent } from "@/lib/omnibar/types"
import { EventIconView } from "../atoms/event-icon.view"
import { ActivityIndicatorView } from "../atoms/activity-indicator.view"

type Activity = Extract<OmnibarEvent, { type: "activity" }>
export function ActivityEventView({ event }: { event: Activity }) {
  return <article className="flex gap-3"><EventIconView type="activity" /><div className="min-w-0 flex-1 rounded-[var(--radius-lg)] border border-border/70 bg-muted/45 px-4 py-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-foreground">{event.title}</p>{event.status === "working" ? <ActivityIndicatorView /> : <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-success">Complete</span>}</div><p className="mt-1 text-xs leading-5 text-muted-foreground">{event.detail}</p></div></article>
}
