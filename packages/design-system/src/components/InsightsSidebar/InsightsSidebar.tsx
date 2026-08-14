import { Clock, Zap, Plus } from "lucide-react";

export interface OrderSupplier {
  id: string;
  name: string;
  deliveryDays: number[];
}
/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function getNextDelivery(deliveryDays: number[]): string {
  if (!deliveryDays.length) return "No schedule";
  const today = new Date().getDay();
  const sorted = [...deliveryDays].sort((a, b) => a - b);
  const next = sorted.find((d) => d > today) ?? sorted[0];
  const daysUntil = next > today ? next - today : 7 - today + next;
  const date = new Date();
  date.setDate(date.getDate() + daysUntil);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* ─── InsightsSidebar ─────────────────────────────────────────────────────── */

export interface InsightsSidebarProps {
  /** List of suppliers to render in the schedule section. */
  suppliers: OrderSupplier[];
  /** Called when the user clicks the "Add Vendor" CTA. */
  onAddVendor?: () => void;
}

/**
 * Sticky sidebar for the Order Manager page.
 *
 * Contains two cards:
 *  1. **Insights** — cutoff reminders + per-supplier next-delivery schedule
 *  2. **New Supplier CTA** — solid cyan card with an "Add Vendor" action
 *
 * Uses semantic CSS tokens so it responds correctly to light/dark mode.
 */
export function InsightsSidebar({
  suppliers,
  onAddVendor,
}: InsightsSidebarProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* ── Insights Card ─────────────────────────────────────────────── */}
      <div className="bg-card dark:bg-card/60 border-border dark:border-border rounded-3xl border p-6 shadow-2xl">
        <p className="text-foreground mb-6 flex flex-row items-center gap-2 text-xs font-black tracking-[0.2em] uppercase">
          <Zap size={13} className="text-amber-500" fill="currentColor" />
          Insights
        </p>

        <div className="flex flex-col gap-6">
          {/* Cutoff Reminders */}
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-[10px] leading-tight font-black uppercase">
              Cutoff Reminders
            </p>
            <div className="bg-muted/40 border-border flex flex-col items-center justify-center rounded-2xl border border-dashed p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
              <Clock
                size={22}
                className="text-muted-foreground/30 mb-2 dark:text-zinc-700"
              />
              <p className="text-muted-foreground text-center text-[9px] font-black tracking-widest uppercase">
                No orders reaching cutoff in next 4h
              </p>
            </div>
          </div>

          {/* Supplier Schedule */}
          {suppliers.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-[10px] leading-tight font-black uppercase">
                Supplier Schedule
              </p>
              <div className="flex flex-col gap-2">
                {suppliers.map((s) => (
                  <div
                    key={s.id}
                    className="bg-muted/30 border-border/40 flex flex-row items-center justify-between rounded-xl border p-3 dark:border-zinc-700/40 dark:bg-zinc-800/30"
                  >
                    <span className="text-foreground/70 truncate pr-2 text-[9px] font-black uppercase">
                      {s.name}
                    </span>
                    <span className="text-primary shrink-0 text-[8px] font-black uppercase">
                      {getNextDelivery(s.deliveryDays)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── New Supplier CTA Card ──────────────────────────────────────── */}
      <div className="bg-primary border-primary/80 shadow-primary/20 rounded-3xl border p-6 shadow-2xl">
        <div className="mb-4 flex flex-row items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Plus size={15} className="text-foreground" />
          </div>
          <span className="text-foreground text-[10px] font-black tracking-widest uppercase">
            New Supplier
          </span>
        </div>
        <p className="text-foreground/80 mb-6 text-xs leading-relaxed font-medium">
          Expand your network to optimize pricing and availability.
        </p>
        <button
          onClick={onAddVendor}
          className="text-foreground h-10 w-full rounded-xl border border-white/20 bg-white/10 text-[10px] font-black tracking-widest uppercase transition-colors hover:bg-white/20"
        >
          Add Vendor
        </button>
      </div>
    </div>
  );
}
