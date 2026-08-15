import { CreditCard, Wifi } from "lucide-react"
import type { CartLine, OrderType, PosCategory, PosItem } from "@/lib/pos/data"
import { PosCatalogView } from "./organisms/pos-catalog.view"
import { PosCartView } from "./organisms/pos-cart.view"

export function PosScreenView(props: { items: PosItem[]; categories: PosCategory[]; category: PosCategory; query: string; lines: CartLine[]; orderType: OrderType; subtotal: number; tax: number; total: number; paid: boolean; onCategoryChange: (value: PosCategory) => void; onQueryChange: (value: string) => void; onAdd: (item: PosItem) => void; onOrderTypeChange: (value: OrderType) => void; onQuantity: (id: string, delta: number) => void; onClear: () => void; onPay: () => void }) {
  return (
    <main className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-background p-3 sm:p-4">
      <header className="mb-3 flex h-11 shrink-0 items-center justify-between gap-3 px-1"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-primary/20 bg-primary/8 text-primary"><CreditCard className="h-4 w-4" /></div><div className="min-w-0"><h1 className="truncate font-display text-lg font-semibold tracking-tight">Main register</h1><p className="truncate text-xs text-muted-foreground">Sunday lunch · Terminal 01</p></div></div><div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Wifi className="h-3.5 w-3.5 text-success" /><span className="hidden sm:inline">Synced</span><span className="h-1.5 w-1.5 rounded-full bg-success" /></div></header>
      {props.paid && <div role="status" className="mb-3 shrink-0 rounded-[var(--radius-md)] border border-success/30 bg-success/10 px-4 py-2.5 text-sm font-medium text-success">Payment approved. Order sent to the kitchen.</div>}
      <div className="flex min-h-0 flex-1 gap-3"><PosCatalogView {...props} /><PosCartView {...props} /></div>
    </main>
  )
}
