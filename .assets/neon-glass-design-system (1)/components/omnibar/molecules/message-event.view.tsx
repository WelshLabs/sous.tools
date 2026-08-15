import type { OmnibarEvent } from "@/lib/omnibar/types"
import { EventIconView } from "../atoms/event-icon.view"

type MessageEvent = Extract<OmnibarEvent, { type: "user" | "agent" }>
export function MessageEventView({ event }: { event: MessageEvent }) {
  const user = event.type === "user"
  return <article className={`flex gap-3 ${user ? "flex-row-reverse" : ""}`}><EventIconView type={event.type} /><div className={`max-w-[86%] rounded-[var(--radius-lg)] border px-4 py-3 text-sm leading-6 shadow-sm ${user ? "border-primary/15 bg-primary/[.08] text-foreground" : "border-border bg-card/78 text-foreground backdrop-blur-xl"}`}><p>{event.text}</p><span className="mt-1.5 block text-[10px] uppercase tracking-[.16em] text-muted-foreground">{event.createdAt}</span></div></article>
}
