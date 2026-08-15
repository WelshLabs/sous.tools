import { Minus, Plus, ReceiptText, Trash2 } from "lucide-react"
import type { CartLine, OrderType } from "@/lib/pos/data"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"

export function PosCartView({ lines, orderType, subtotal, tax, total, onOrderTypeChange, onQuantity, onClear, onPay }: { lines: CartLine[]; orderType: OrderType; subtotal: number; tax: number; total: number; onOrderTypeChange: (value: OrderType) => void; onQuantity: (id: string, delta: number) => void; onClear: () => void; onPay: () => void }) {
  return (
    <aside className="flex h-full min-h-0 w-[min(36vw,390px)] min-w-[310px] shrink-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card/90 shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border p-5"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Current order</p><h2 className="mt-1 font-display text-xl font-semibold">Order #1048</h2></div><ReceiptText className="h-5 w-5 text-muted-foreground" /></div>
      <div className="flex gap-2 border-b border-border p-4">{(["Dine in", "Takeout"] as OrderType[]).map((type) => <Chip key={type} className="flex-1 justify-center" selected={orderType === type} onClick={() => onOrderTypeChange(type)}>{type}</Chip>)}</div>
      <div className="flex min-h-48 flex-1 flex-col gap-2 overflow-y-auto p-4">
        {lines.length === 0 ? <div className="m-auto flex max-w-52 flex-col items-center text-center"><ReceiptText className="mb-3 h-8 w-8 text-muted-foreground/50" /><p className="font-medium">No items yet</p><p className="mt-1 text-sm text-muted-foreground">Tap a menu item to start this order.</p></div> : lines.map((line) => (
          <div key={line.id} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background/45 p-3">
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{line.name}</p><p className="font-mono text-xs text-muted-foreground">${line.price.toFixed(2)}</p></div>
            <div className="flex items-center gap-2"><button aria-label={`Remove one ${line.name}`} onClick={() => onQuantity(line.id, -1)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button><span className="w-5 text-center font-mono text-sm">{line.quantity}</span><button aria-label={`Add one ${line.name}`} onClick={() => onQuantity(line.id, 1)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><Plus className="h-3.5 w-3.5" /></button></div>
            <span className="w-16 text-right font-mono text-sm font-semibold">${(line.price * line.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-5"><div className="flex flex-col gap-2 text-sm"><div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div><div className="flex justify-between text-muted-foreground"><span>Tax</span><span className="font-mono">${tax.toFixed(2)}</span></div><div className="my-2 h-px bg-border" /><div className="flex justify-between text-lg font-semibold"><span>Total</span><span className="font-mono">${total.toFixed(2)}</span></div></div><div className="mt-5 flex gap-2"><Button variant="ghost" size="icon" onClick={onClear} aria-label="Clear order"><Trash2 className="h-4 w-4" /></Button><Button className="flex-1" onClick={onPay} disabled={!lines.length}>Charge ${total.toFixed(2)}</Button></div></div>
    </aside>
  )
}
