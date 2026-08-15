import { Clock3, Grid2X2, LayoutList, Rows3 } from "lucide-react"
import type { KdsLayout, KitchenStation, Ticket } from "@/lib/kds/data"
import { Chip } from "@/components/ui/chip"
import { TicketCardView } from "./organisms/ticket-card.view"

export function KdsScreenView({ tickets, station, layout, now, onStationChange, onLayoutChange, onToggleItem, onAdvance }: { tickets: Ticket[]; station: KitchenStation; layout: KdsLayout; now: string; onStationChange: (value: KitchenStation) => void; onLayoutChange: (value: KdsLayout) => void; onToggleItem: (ticketId: string, itemId: string) => void; onAdvance: (ticketId: string) => void }) {
 const stations: KitchenStation[]=["All","Grill","Sauté","Cold"]
 const layouts=[{key:"rail" as const,label:"Rail",icon:LayoutList},{key:"grid" as const,label:"Grid",icon:Grid2X2},{key:"compact" as const,label:"Compact",icon:Rows3}]
 const ordered=[...tickets].sort((a,b)=>b.createdMinutesAgo-a.createdMinutesAgo)
 const collection=layout==="grid"?"grid grid-cols-2 content-start gap-3 overflow-y-auto xl:grid-cols-3":layout==="compact"?"flex items-start gap-2 overflow-x-auto":"flex items-start gap-3 overflow-x-auto"
 return <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background p-3 sm:p-4">
  <header className="mb-3 flex shrink-0 items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div><h1 className="font-display text-lg font-semibold tracking-tight">Lunch service</h1><p className="text-xs text-muted-foreground">{tickets.length} active · Main kitchen</p></div><div className="hidden gap-1 sm:flex">{stations.map(item=><Chip key={item} selected={station===item} onClick={()=>onStationChange(item)}>{item}</Chip>)}</div></div><div className="flex items-center gap-3"><div className="flex rounded-[var(--radius-md)] border border-border bg-card p-1">{layouts.map(item=>{const Icon=item.icon;return <button key={item.key} onClick={()=>onLayoutChange(item.key)} aria-label={`${item.label} ticket layout`} aria-pressed={layout===item.key} className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors ${layout===item.key?"bg-primary/12 text-primary":"text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="h-4 w-4"/></button>})}</div><span className="flex items-center gap-2 font-mono text-base font-semibold"><Clock3 className="h-4 w-4 text-muted-foreground"/>{now}</span></div></header>
  <section aria-label="Active kitchen tickets" className={`min-h-0 flex-1 rounded-[var(--radius-lg)] border border-border bg-muted/25 p-3 ${collection}`}>{ordered.map(ticket=><div key={ticket.id} className={layout==="grid"?"min-w-0":layout==="compact"?"w-72 shrink-0":"w-80 shrink-0"}><TicketCardView ticket={ticket} onToggleItem={item=>onToggleItem(ticket.id,item)} onAdvance={()=>onAdvance(ticket.id)}/></div>)}{ordered.length===0&&<p className="m-auto text-sm text-muted-foreground">No active tickets</p>}</section>
 </main>
}
