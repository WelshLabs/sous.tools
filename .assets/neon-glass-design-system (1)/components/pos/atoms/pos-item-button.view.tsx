"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import type { PosItem } from "@/lib/pos/data"
import { cn } from "@/lib/utils"

export function PosItemButtonView({ item, onAdd }: { item: PosItem; onAdd: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={item.available ? { scale: 0.975 } : undefined}
      disabled={!item.available}
      onClick={onAdd}
      className={cn("group flex min-h-32 flex-col justify-between rounded-[var(--radius-lg)] border border-border bg-card/75 p-4 text-left shadow-sm transition-[border-color,background-color,box-shadow] hover:border-primary/35 hover:bg-card hover:shadow-md", !item.available && "opacity-45")}
    >
      <div>
        <p className="font-display font-semibold text-foreground">{item.name}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="font-mono text-sm font-semibold text-foreground">${item.price.toFixed(2)}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Plus className="h-4 w-4" /></span>
      </div>
    </motion.button>
  )
}
