"use client"

import { motion } from "framer-motion"
import { Check, Clock3 } from "lucide-react"
import type { Ticket, TicketStatus } from "@/lib/kds/data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const nextLabel: Record<TicketStatus, string> = { new: "Start cooking", cooking: "Mark ready", ready: "Complete", completed: "Completed" }
export function TicketCardView({ ticket, onToggleItem, onAdvance }: { ticket: Ticket; onToggleItem: (itemId: string) => void; onAdvance: () => void }) {
 const urgent = ticket.createdMinutesAgo >= 12
 return <motion.article layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={cn("overflow-hidden rounded-[var(--radius-lg)] border bg-card shadow-sm", urgent ? "border-warning/50" : "border-border")}>
  <div className="flex items-start justify-between border-b border-border p-4"><div><p className="font-mono text-xl font-bold">#{ticket.number}</p><p className="mt-1 text-xs text-muted-foreground">{ticket.type} · {ticket.destination}</p></div><span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs", urgent ? "bg-warning/12 text-warning" : "bg-muted text-muted-foreground")}><Clock3 className="h-3 w-3" />{ticket.createdMinutesAgo}m</span></div>
  <div className="flex flex-col gap-1 p-3">{ticket.items.map((item)=><button key={item.id} onClick={()=>onToggleItem(item.id)} className={cn("flex w-full items-start gap-3 rounded-[var(--radius-sm)] p-2 text-left hover:bg-muted/70",item.done&&"opacity-50")}><span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",item.done?"border-success bg-success text-success-foreground":"border-border")}><Check className={cn("h-3 w-3",!item.done&&"opacity-0")} /></span><span className="font-mono text-sm font-semibold">{item.quantity}×</span><span className="min-w-0 flex-1"><span className={cn("block text-sm font-medium",item.done&&"line-through")}>{item.name}</span>{item.modifier&&<span className="mt-0.5 block text-xs font-medium text-warning">{item.modifier}</span>}</span></button>)}</div>
  <div className="border-t border-border p-3"><Button className="w-full" variant={ticket.status==="ready"?"primary":"outline"} onClick={onAdvance}>{nextLabel[ticket.status]}</Button></div>
 </motion.article>
}
