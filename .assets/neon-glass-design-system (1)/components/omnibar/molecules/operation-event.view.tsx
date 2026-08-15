import { Check, ChevronRight } from "lucide-react"
import type { OmnibarEvent } from "@/lib/omnibar/types"
import { Button } from "@/components/ui/button"
import { EventIconView } from "../atoms/event-icon.view"

type Operation = Extract<OmnibarEvent, { type: "change" | "ingestion" }>
export function OperationEventView({ event, onApply }: { event: Operation; onApply: (id: string) => void }) {
  const applied = event.type === "change" && event.status === "applied"
  return <article className="flex gap-3"><EventIconView type={event.type} /><div className="min-w-0 flex-1 rounded-[var(--radius-lg)] border border-primary/15 bg-[color-mix(in_srgb,var(--card)_92%,var(--primary)_8%)] p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-foreground">{event.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{event.detail}</p></div>{event.type === "change" && <Button size="sm" variant={applied ? "outline" : "primary"} disabled={applied} onClick={() => onApply(event.id)}>{applied ? <><Check className="h-3.5 w-3.5" />Applied</> : <>Review <ChevronRight className="h-3.5 w-3.5" /></>}</Button>}</div>{event.type === "ingestion" && <div className="mt-3 flex flex-wrap gap-2">{event.items.map(item => <span key={item.label} className="rounded-full border border-border bg-background/50 px-3 py-1 text-xs text-muted-foreground"><strong className="text-foreground">{item.value}</strong> {item.label}</span>)}</div>}</div></article>
}
