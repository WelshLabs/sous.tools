"use client";

import { TwoToneHeader } from "@soustools/design-system";
import Link from "next/link";
import {
  FileUp,
  ShoppingCart,
  Activity,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function InventoryPage() {
  return (
    <div className="bg-background text-foreground animate-in fade-in flex h-full flex-col gap-8 p-8">
      <TwoToneHeader title="Inventory Command Center" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Quick Actions (Left Column) */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wider uppercase">
            Quick Actions
          </h3>
          <Link
            href="/orders"
            className="glass-panel group flex items-center gap-4 p-6 transition-colors hover:border-sky-500/50"
          >
            <div className="rounded-xl bg-sky-500/20 p-3 text-sky-400 transition-transform group-hover:scale-110">
              <ShoppingCart size={24} />
            </div>
            <div className="text-lg font-bold">New Order</div>
          </Link>
          <button
            className="glass-panel group flex items-center gap-4 p-6 text-left transition-colors hover:border-cyan-500/50"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("trigger-omnibar-upload"))
            }
          >
            <div className="rounded-xl bg-cyan-500/20 p-3 text-cyan-400 transition-transform group-hover:scale-110">
              <FileUp size={24} />
            </div>
            <div className="text-lg font-bold">Upload Invoice</div>
          </button>
        </div>

        {/* Center Feed */}
        <div className="flex flex-col gap-6 lg:col-span-6">
          <div className="glass-panel border-t-4 border-t-emerald-500 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <Activity className="text-emerald-400" /> Active Orders
              </h3>
              <Link
                href="/orders"
                className="text-sm text-sky-400 hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4">
                <div>
                  <div className="font-bold">Sysco Delivery</div>
                  <div className="text-muted-foreground text-sm">
                    Arriving Tomorrow, 8:00 AM
                  </div>
                </div>
                <div className="rounded bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-400 uppercase">
                  Dispatched
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel border-t-4 border-t-amber-500 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <Sparkles className="text-amber-400" /> Ingestion Queue
              </h3>
              <Link
                href="/ingestion"
                className="text-sm text-sky-400 hover:underline"
              >
                Manage Queue
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4">
                <div>
                  <div className="font-bold">US Foods Invoice</div>
                  <div className="text-muted-foreground text-sm">
                    Extracting line items...
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded bg-amber-500/20 px-3 py-1 text-sm font-bold text-amber-400 uppercase">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />{" "}
                  Processing
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Stats */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wider uppercase">
            Vendor Wars
          </h3>
          <div className="glass-panel relative flex flex-col gap-4 overflow-hidden border-t-4 border-t-rose-500 p-6">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldAlert size={100} />
            </div>
            <div className="relative z-10 flex items-center gap-2 font-bold text-rose-400">
              <TrendingUp size={20} /> Open Balances
            </div>
            <div className="relative z-10 text-4xl font-black">$12,450</div>
            <div className="text-muted-foreground relative z-10 mt-4 text-sm">
              <div className="mb-1 flex justify-between">
                <span>Sysco</span>{" "}
                <span className="font-bold text-white">$8,200</span>
              </div>
              <div className="mb-1 flex justify-between">
                <span>US Foods</span>{" "}
                <span className="font-bold text-white">$3,150</span>
              </div>
              <div className="mb-1 flex justify-between">
                <span>Local Produce</span>{" "}
                <span className="font-bold text-white">$1,100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
