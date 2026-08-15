import { Search } from "lucide-react"
import type { PosCategory, PosItem } from "@/lib/pos/data"
import { Chip } from "@/components/ui/chip"
import { PosItemButtonView } from "../atoms/pos-item-button.view"

export function PosCatalogView({ items, categories, category, query, onCategoryChange, onQueryChange, onAdd }: { items: PosItem[]; categories: PosCategory[]; category: PosCategory; query: string; onCategoryChange: (value: PosCategory) => void; onQueryChange: (value: string) => void; onAdd: (item: PosItem) => void }) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card/45 p-3 sm:p-4">
      <div className="flex shrink-0 flex-col gap-3">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search menu" aria-label="Search menu" className="h-12 w-full rounded-[var(--radius-md)] border border-border bg-card/70 pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => <Chip key={item} selected={item === category} onClick={() => onCategoryChange(item)}>{item}</Chip>)}
        </div>
      </div>
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pr-1 md:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => <PosItemButtonView key={item.id} item={item} onAdd={() => onAdd(item)} />)}
      </div>
    </section>
  )
}
