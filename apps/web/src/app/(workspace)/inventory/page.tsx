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
    <div className="flex flex-col gap-8 p-8 h-full bg-background text-foreground animate-in fade-in">
      <TwoToneHeader title="Inventory Command Center" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions (Left Column) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Quick Actions
          </h3>
          <Link
            href="/inventory/orders/new"
            className="glass-panel p-6 flex items-center gap-4 group hover:border-sky-500/50 transition-colors"
          >
            <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
              <ShoppingCart size={24} />
            </div>
            <div className="font-bold text-lg">New Order</div>
          </Link>
          <button
            className="glass-panel p-6 flex items-center gap-4 group hover:border-cyan-500/50 transition-colors text-left"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("trigger-omnibar-upload"))
            }
          >
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <FileUp size={24} />
            </div>
            <div className="font-bold text-lg">Upload Invoice</div>
          </button>
        </div>

        {/* Center Feed */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="glass-panel p-6 border-t-4 border-t-emerald-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-emerald-400" /> Active Orders
              </h3>
              <Link
                href="/inventory/orders"
                className="text-sm text-sky-400 hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <div className="font-bold">Sysco Delivery</div>
                  <div className="text-sm text-muted-foreground">
                    Arriving Tomorrow, 8:00 AM
                  </div>
                </div>
                <div className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 text-sm font-bold uppercase">
                  Dispatched
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 border-t-4 border-t-amber-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
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
              <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <div className="font-bold">US Foods Invoice</div>
                  <div className="text-sm text-muted-foreground">
                    Extracting line items...
                  </div>
                </div>
                <div className="flex gap-1 items-center px-3 py-1 rounded bg-amber-500/20 text-amber-400 text-sm font-bold uppercase">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />{" "}
                  Processing
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Stats */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Vendor Wars
          </h3>
          <div className="glass-panel p-6 flex flex-col gap-4 border-t-4 border-t-rose-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldAlert size={100} />
            </div>
            <div className="text-rose-400 font-bold flex items-center gap-2 relative z-10">
              <TrendingUp size={20} /> Open Balances
            </div>
            <div className="text-4xl font-black relative z-10">$12,450</div>
            <div className="text-sm text-muted-foreground mt-4 relative z-10">
              <div className="flex justify-between mb-1">
                <span>Sysco</span>{" "}
                <span className="font-bold text-white">$8,200</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>US Foods</span>{" "}
                <span className="font-bold text-white">$3,150</span>
              </div>
              <div className="flex justify-between mb-1">
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
