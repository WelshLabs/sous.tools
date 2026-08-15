import type { OmnibarEvent } from "@/lib/omnibar/types"
import { EventIconView } from "../atoms/event-icon.view"

type Metrics = Extract<OmnibarEvent, { type: "metrics" }>
export function MetricsEventView({ event }: { event: Metrics }) {
  return <article className="flex gap-3"><EventIconView type="metrics" /><div className="min-w-0 flex-1 rounded-[var(--radius-lg)] border border-border bg-card/82 p-4 shadow-sm backdrop-blur-xl"><p className="text-sm font-semibold text-foreground">{event.title}</p><div className="mt-3 grid grid-cols-3 gap-2">{event.metrics.map(metric => <div key={metric.label} className="rounded-[var(--radius-md)] border border-border/70 bg-muted/35 p-3"><p className="text-[10px] font-medium uppercase tracking-[.14em] text-muted-foreground">{metric.label}</p><p className="mt-1 font-display text-lg font-bold text-foreground">{metric.value}</p>{metric.change && <p className="text-xs font-medium text-success">{metric.change}</p>}</div>)}</div></div></article>
}
