"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Tv, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw
} from "lucide-react";
import { Button } from "@soustools/ui";

interface DisplayStatus {
  id: string;
  name: string;
  isOnline: boolean;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [onlineDisplays, setOnlineDisplays] = useState<DisplayStatus[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Top Metrics
  const foodCostPercent = 28.4;
  const mtdGrossProfit = 34520.00;
  const totalSales = 121549.50;

  // Alerts
  const priceSpikes = [
    { name: "Unsalted Butter (Euro)", oldPrice: 4.20, newPrice: 5.80, change: 38 },
    { name: "Fresh Cilantro (Bunch)", oldPrice: 0.89, newPrice: 1.45, change: 62 },
  ];
  
  const lowPars = [
    { name: "Truffle Oil", current: 2, par: 5 },
    { name: "Ribeye Steak 12oz", current: 8, par: 20 },
  ];

  const marginDrivers = [
    { name: "Truffle Fries", margin: 82 },
    { name: "Craft IPA Pint", margin: 76 },
  ];

  const marginBleeders = [
    { name: "Garlic Salmon Fillet", margin: 18 },
    { name: "Avocado Toast", margin: 24 },
  ];

  const fetchActiveDisplays = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch displays from Supabase
      const { data: dbDisplays } = await supabase
        .from("signage_displays")
        .select("id, name");

      // 2. Fetch active WebSocket connections from NestJS
      const connRes = await fetch("/api/signage/displays/active-connections");
      let activeConnections: Record<string, boolean> = {};
      if (connRes.ok) {
        const payload = await connRes.json();
        if (payload.success) {
          activeConnections = payload.data || {};
        }
      }

      if (dbDisplays) {
        const mapped = dbDisplays.map((d: any) => ({
          id: d.id,
          name: d.name,
          isOnline: !!activeConnections[d.id]
        }));
        setOnlineDisplays(mapped);
      }
    } catch (err) {
      console.error("Failed to load display connection status:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveDisplays();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-slate-100 tracking-tight">BOH Command Center</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Real-time telemetry and profit margins for your kitchen.</p>
        </div>
        <Button onClick={fetchActiveDisplays} disabled={refreshing} variant="outline" className="flex items-center gap-1.5 border-zinc-800">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Reload Analytics
        </Button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-sky-400 bg-sky-500/10 p-2 rounded-xl border border-sky-500/20">
            <TrendingDown className="w-5 h-5" />
          </div>
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider block">Food Cost %</span>
          <span className="text-3xl font-extrabold text-white mt-3 block">{foodCostPercent}%</span>
          <span className="text-emerald-400 text-xs mt-2 flex items-center gap-1 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5" /> -1.2% this week
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-violet-400 bg-violet-500/10 p-2 rounded-xl border border-violet-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider block">MTD Gross Profit</span>
          <span className="text-3xl font-extrabold text-white mt-3 block">
            ${mtdGrossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-emerald-400 text-xs mt-2 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> +8.4% vs last month
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-sky-400 bg-sky-500/10 p-2 rounded-xl border border-sky-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider block">Total Synced Sales</span>
          <span className="text-3xl font-extrabold text-white mt-3 block">
            ${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-emerald-400 text-xs mt-2 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> Synchronized with Square
          </span>
        </div>
      </div>

      {/* Main Grid: Alerts / Drivers & Signage Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alerts & Critical Stock */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Price Spikes & Low Pars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Critical Price Spikes
              </h3>
              <div className="space-y-3">
                {priceSpikes.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-xl p-3">
                    <div>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">{item.name}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 block">${item.oldPrice} ➔ ${item.newPrice}</span>
                    </div>
                    <span className="text-rose-400 text-xs font-bold font-mono">+{item.change}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Low Par Alert
              </h3>
              <div className="space-y-3">
                {lowPars.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-xl p-3">
                    <div>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">{item.name}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 block">Target Par: {item.par}</span>
                    </div>
                    <span className="text-rose-400 text-xs font-bold font-mono">{item.current} remaining</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Margins */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4" /> Top Margin Drivers
              </h3>
              <div className="space-y-3">
                {marginDrivers.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-xl p-3">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.name}</span>
                    <span className="text-emerald-400 text-xs font-extrabold">{item.margin}% margin</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4" /> Margin Bleeders
              </h3>
              <div className="space-y-3">
                {marginBleeders.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-xl p-3">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.name}</span>
                    <span className="text-rose-400 text-xs font-extrabold">{item.margin}% margin</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Digital Signage Connection Statuses */}
        <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5 flex flex-col">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Tv className="w-4 h-4 text-sky-400" /> Digital Signage Telemetry
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {loading ? (
              <div className="text-center text-zinc-400 dark:text-zinc-500 py-6 text-xs">Polling active display ports...</div>
            ) : onlineDisplays.length === 0 ? (
              <div className="text-center text-zinc-400 dark:text-zinc-500 py-6 text-xs">No active displays registered.</div>
            ) : (
              onlineDisplays.map((display) => (
                <div key={display.id} className="flex justify-between items-center bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-xl p-3.5">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">{display.name}</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-0.5">Port ID: {display.id.slice(0, 8)}...</span>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    display.isOnline 
                      ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                      : "text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border-zinc-800"
                  }`}>
                    <Activity className="w-3 h-3" />
                    {display.isOnline ? "Active" : "Offline"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
