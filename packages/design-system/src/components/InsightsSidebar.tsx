
import { Clock, Zap, Plus } from "lucide-react";
import type { OrderSupplier } from "./SupplierOrderGroup";

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
      <div className="p-6 bg-card dark:bg-card/60 border border-border dark:border-border rounded-3xl shadow-2xl">
        <p className="text-foreground font-black uppercase text-xs tracking-[0.2em] mb-6 flex flex-row items-center gap-2">
          <Zap size={13} className="text-amber-500" fill="currentColor" />
          Insights
        </p>

        <div className="flex flex-col gap-6">
          {/* Cutoff Reminders */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground leading-tight">
              Cutoff Reminders
            </p>
            <div className="p-4 bg-muted/40 dark:bg-zinc-800/40 border border-border dark:border-zinc-700 border-dashed rounded-2xl flex flex-col items-center justify-center">
              <Clock
                size={22}
                className="text-muted-foreground/30 dark:text-zinc-700 mb-2"
              />
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center">
                No orders reaching cutoff in next 4h
              </p>
            </div>
          </div>

          {/* Supplier Schedule */}
          {suppliers.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground leading-tight">
                Supplier Schedule
              </p>
              <div className="flex flex-col gap-2">
                {suppliers.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-row items-center justify-between p-3 bg-muted/30 dark:bg-zinc-800/30 border border-border/40 dark:border-zinc-700/40 rounded-xl"
                  >
                    <span className="text-[9px] font-black uppercase text-foreground/70 truncate pr-2">
                      {s.name}
                    </span>
                    <span className="text-[8px] font-black uppercase text-primary shrink-0">
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
      <div className="p-6 bg-primary border border-primary/80 rounded-3xl shadow-2xl shadow-primary/20">
        <div className="flex flex-row items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Plus size={15} className="text-foreground" />
          </div>
          <span className="text-foreground font-black uppercase text-[10px] tracking-widest">
            New Supplier
          </span>
        </div>
        <p className="text-foreground/80 text-xs mb-6 font-medium leading-relaxed">
          Expand your network to optimize pricing and availability.
        </p>
        <button
          onClick={onAddVendor}
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-foreground rounded-xl h-10 font-black uppercase text-[10px] tracking-widest transition-colors"
        >
          Add Vendor
        </button>
      </div>
    </div>
  );
}
