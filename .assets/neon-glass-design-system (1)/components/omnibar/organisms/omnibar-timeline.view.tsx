"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import type { OmnibarEvent } from "@/lib/omnibar/types"
import { OmnibarEventView } from "./omnibar-event.view"

export function OmnibarTimelineView({ events, onApply, onClear }: { events: OmnibarEvent[]; onApply: (id: string) => void; onClear: () => void }) {
  if (!events.length) return null
  return <section aria-label="Conversation with sous chef" className="relative mx-auto w-full max-w-3xl"><div className="mb-3 flex items-center justify-between px-2"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-muted-foreground">Sous chef</p><button type="button" onClick={onClear} className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Trash2 className="h-3.5 w-3.5" />Clear</button></div><div className="max-h-[min(62vh,620px)] overflow-y-auto px-1 pb-4 [mask-image:linear-gradient(to_bottom,transparent_0,black_5%,black_100%)]"><div className="flex flex-col gap-3 pt-6"><AnimatePresence initial={false}>{events.map(event => <motion.div key={event.id} initial={{ opacity: 0, y: 12, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .28, ease: [0.22,1,0.36,1] }}><OmnibarEventView event={event} onApply={onApply} /></motion.div>)}</AnimatePresence></div></div></section>
}
