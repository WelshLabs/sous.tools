"use client";

import Link from "next/link";
import { TwoToneHeader } from "@soustools/design-system";
import {
  FileUp,
  ShoppingCart,
  Activity,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export interface InventoryOverviewViewProps {
  onUploadInvoiceClick: () => void;
}

export function InventoryOverviewView({
  onUploadInvoiceClick,
}: InventoryOverviewViewProps) {
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
            onClick={onUploadInvoiceClick}
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
            <div className="text-muted-foreground py-8 text-center text-sm">
              All caught up! No active purchase orders requiring attention.
            </div>
          </div>

          <div className="glass-panel border-t-4 border-t-amber-500 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <ShieldAlert className="text-amber-400" /> Discrepancies &
                Alerts
              </h3>
            </div>
            <div className="text-muted-foreground py-8 text-center text-sm">
              No inventory or cost variances detected.
            </div>
          </div>
        </div>

        {/* Right Insights Column */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <div className="glass-panel border-t-4 border-t-purple-500 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Sparkles className="text-purple-400" /> Chef Intelligence
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Based on historical usage, consider ordering dairy items before
              Thursday cutoff.
            </p>
          </div>

          <div className="glass-panel p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <TrendingUp className="text-sky-400" /> Spending Overview
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  This Month
                </div>
                <div className="mt-1 font-mono text-2xl font-bold">$0.00</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Avg. Variance
                </div>
                <div className="mt-1 font-mono text-xl font-bold text-emerald-400">
                  0.0%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
