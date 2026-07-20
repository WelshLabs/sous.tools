"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button, OmniBar } from "@soustools/design-system";
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  Search,
  PackageX,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface KDSTicketItem {
  name: string;
  qty: number;
  notes?: string;
}

interface KDSTicket {
  id: string;
  ticketNumber: string;
  tableNumber: string;
  items: KDSTicketItem[];
  createdAt: string;
  isRush?: boolean;
  status: "OPEN" | "CLOSED";
}

export default function KDSPage() {
  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [posItems, setPosItems] = useState<any[]>([]);
  const [orgId] = useState<string>("d0000000-0000-0000-0000-000000000000");
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState<"OPEN" | "CLOSED">("OPEN");

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [textSize, setTextSize] = useState<"sm" | "md" | "lg">("md");
  const [density, setDensity] = useState<"compact" | "standard" | "spacious">("standard");
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.5);

  // 86'd inventory search
  const [searchQuery, setSearchQuery] = useState("");

  // Programmatic synth chime using AudioContext
  const playChime = (type: "new" | "complete") => {
    if (typeof window === "undefined" || !soundsEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(soundVolume, ctx.currentTime);

      if (type === "new") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
        osc.type = "triangle";
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.type = "sine";
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("AudioContext chime failure:", e);
    }
  };

  // Load configuration, mock tickets, database items
  useEffect(() => {
    // 1. Fetch POS items to enable 86'ing
    const fetchItems = async () => {
      try {
        const { data, error } = await api.GET("/pos-simulator/items", { params: { query: { organizationId: orgId } } });
        if (!error && data) setPosItems((data as any).data || []);
      } catch (err) {
        console.error("Failed to fetch pos items", err);
      }
    };

    // 2. Setup settings from localStorage
    if (typeof window !== "undefined") {
      const savedText = localStorage.getItem("kds_text_size") as any;
      const savedDensity = localStorage.getItem("kds_density") as any;
      const savedSound = localStorage.getItem("kds_sounds_enabled");
      const savedVol = localStorage.getItem("kds_sound_volume");
      if (savedText) setTextSize(savedText);
      if (savedDensity) setDensity(savedDensity);
      if (savedSound) setSoundsEnabled(savedSound === "true");
      if (savedVol) setSoundVolume(parseFloat(savedVol));
    }

    // 3. Fetch POS orders to seed tickets
    const fetchOrders = async () => {
      try {
        const { data, error } = await api.GET("/pos/orders", { params: { query: { orgId } } });
        if (!error && data) {
          const payload = (data as any).data || data;
          if (Array.isArray(payload)) {
            setTickets(payload.map((o: any) => ({
              id: o.id,
              ticketNumber: o.external_id.substring(o.external_id.length - 4),
              tableNumber: o.location_id || "Unknown",
              createdAt: o.created_at,
              isRush: false,
              status: o.state === "COMPLETED" ? "CLOSED" : "OPEN",
              items: [{ name: "POS Order Amount", qty: 1, notes: `$${o.total_money}` }]
            })));
          }
        }
      } catch (err) {
        console.error("Failed to fetch pos orders", err);
      }
    };

    Promise.all([fetchItems(), fetchOrders()]).then(() => setLoading(false));
  }, [orgId]);

  // Save settings helpers
  const saveTextSize = (sz: "sm" | "md" | "lg") => {
    setTextSize(sz);
    localStorage.setItem("kds_text_size", sz);
  };
  const saveDensity = (den: "compact" | "standard" | "spacious") => {
    setDensity(den);
    localStorage.setItem("kds_density", den);
  };
  const saveSounds = (enabled: boolean) => {
    setSoundsEnabled(enabled);
    localStorage.setItem("kds_sounds_enabled", enabled ? "true" : "false");
  };
  const saveVolume = (vol: number) => {
    setSoundVolume(vol);
    localStorage.setItem("kds_sound_volume", vol.toString());
  };

  // Complete ticket & sync to shadow DB
  const handleCompleteTicket = async (ticketId: string) => {
    const t = tickets.find(ticket => ticket.id === ticketId);
    if (!t) return;

    try {
      // Opt-in chime play
      playChime("complete");

      // Set ticket to CLOSED locally
      setTickets(prev =>
        prev.map(ticket => (ticket.id === ticketId ? { ...ticket, status: "CLOSED" } : ticket))
      );

      // Sync state to backend shadow DB (pos_transactions)
      const transactionsToInsert = t.items.map(item => {
        // Look up corresponding POS item in DB
        const match = posItems.find(
          (dbItem: any) => dbItem.name.toLowerCase() === item.name.toLowerCase()
        );
        return {
          organization_id: orgId,
          pos_item_id: match ? (match as any).id : null,
          quantity_sold: item.qty,
          gross_revenue: match ? Number((match as any).price) * item.qty : 15.00 * item.qty, // fallback price
          transaction_time: new Date().toISOString(),
          source: "kds"
        };
      });

      const { error: txError } = await api.POST("/pos/transactions/bulk", {
        body: transactionsToInsert as any,
      });
      if (txError) throw new Error("Failed to sync transactions");

      toast.success(`Ticket #${t.ticketNumber} completed and synced to shadow DB.`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Completed locally, but failed database sync: ${err.message}`);
    }
  };

  // 86 / Mark item Unavailable
  const handleToggleSoldOut = async (itemId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    try {
      const { error } = await api.POST("/pos-simulator/items/toggle-sold-out", {
        body: { itemId, isSoldOut: nextStatus } as any,
      });

      if (error) throw new Error("Failed to update item");

      setPosItems(prev =>
        prev.map((item: any) => (item.id === itemId ? { ...item, is_sold_out: nextStatus } : item))
      );
      toast.success(`Updated item availability.`);
    } catch (err: any) {
      toast.error(`Failed to update item availability: ${err.message}`);
    }
  };

  // All Day Prep Aggregation
  const getOpenTicketsItems = () => {
    const counts: Record<string, number> = {};
    tickets
      .filter(t => t.status === "OPEN")
      .forEach(t => {
        t.items.forEach(item => {
          counts[item.name] = (counts[item.name] || 0) + item.qty;
        });
      });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const filteredTickets = tickets.filter(t => t.status === viewFilter);
  const allDayPrep = getOpenTicketsItems();

  // Grid classes mapping density
  const gridClasses = {
    compact: "grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3",
    standard: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
    spacious: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
  }[density];

  // Font classes mapping text sizes
  const fontClasses = {
    sm: { title: "text-xs font-bold", body: "text-xs", notes: "text-[10px]" },
    md: { title: "text-sm font-bold", body: "text-sm", notes: "text-xs" },
    lg: { title: "text-base font-bold", body: "text-base", notes: "text-sm" }
  }[textSize];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-card text-white">
        <div className="w-10 h-10 border-4 border-t-sky-500 border-black/10 dark:border-white/10 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredPosItems = posItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col bg-zinc-50 dark:bg-card text-zinc-900 dark:text-zinc-100 p-6 space-y-6 relative overflow-hidden">
      {/* Navigation & Controls Row */}
      <header className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-shrink-0">
            <OmniBar />
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          {/* Open vs Closed Toggles */}
          <div className="flex bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setViewFilter("OPEN")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                viewFilter === "OPEN" ? "bg-black/10 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Open ({tickets.filter(t => t.status === "OPEN").length})
            </button>
            <button
              onClick={() => setViewFilter("CLOSED")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                viewFilter === "CLOSED" ? "bg-black/10 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Completed ({tickets.filter(t => t.status === "CLOSED").length})
            </button>
          </div>
        </div>

        {/* Settings Trigger */}
        <button
          onClick={() => setShowSettings(true)}
          className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 bg-card hover:bg-black/10 dark:hover:bg-black/10 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer flex-shrink-0"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Layout Grid split into Preparation Rack and All Day Panel */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0 h-[calc(100vh-230px)]">
        {/* Active Ticket Rack */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`flex-1 overflow-y-auto pr-1 grid ${gridClasses} pb-10`}>
            {filteredTickets.length === 0 ? (
              <div className="glass-panel col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground dark:text-zinc-500 rounded-2xl h-64">
                <CheckCircle className="w-12 h-12 text-muted-foreground dark:text-zinc-600 mb-3" />
                <p className="font-bold text-lg text-zinc-600 dark:text-muted-foreground">All tickets completed!</p>
                <p className="text-sm mt-1">Ready for incoming transactions...</p>
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const ageMinutes = Math.floor(
                  (Date.now() - new Date(ticket.createdAt).getTime()) / (60 * 1000)
                );
                return (
                  <div
                    key={ticket.id}
                    className={`glass-panel flex flex-col justify-between rounded-xl p-4 transition-all duration-300 max-h-[360px] overflow-hidden ${
                      ticket.isRush
                        ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-500/5 dark:bg-amber-950/5"
                        : "shadow-lg hover:border-black/20 dark:hover:border-white/20"
                    }`}
                  >
                    <div>
                      {/* Ticket Header */}
                      <div className="flex justify-between items-start pb-2 border-b border-black/5 dark:border-white/5 mb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-black tracking-tight ${fontClasses.title} ${
                              ticket.isRush ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-white"
                            }`}>
                              Ticket #{ticket.ticketNumber}
                            </span>
                            {ticket.isRush && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 font-extrabold uppercase">
                                RUSH
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 dark:text-muted-foreground">{ticket.tableNumber}</span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end text-zinc-500 dark:text-muted-foreground text-xs gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{ageMinutes}m</span>
                          </div>
                        </div>
                      </div>

                      {/* Scrollable Ticket Items */}
                      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                        {ticket.items.map((item, idx) => (
                          <div key={idx} className="flex flex-col">
                            <div className="flex justify-between items-start">
                              <span className={`font-bold text-zinc-900 dark:text-zinc-100 ${fontClasses.body}`}>
                                {item.qty}x {item.name}
                              </span>
                            </div>
                            {item.notes && (
                              <span className={`text-orange-400 font-semibold italic mt-0.5 pl-3 border-l-2 border-orange-500/30 ${fontClasses.notes}`}>
                                * {item.notes}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Completion Action */}
                    {ticket.status === "OPEN" && (
                      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                        <Button
                          onClick={() => handleCompleteTicket(ticket.id)}
                          className="w-full justify-center bg-white text-black hover:bg-zinc-200 py-2.5 font-bold transition-all text-xs rounded-lg"
                        >
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* All Day Prep Panel Drawer */}
        <aside className="glass-panel w-72 rounded-2xl flex flex-col overflow-hidden shrink-0">
          <div className="p-4 bg-black/5 bg-card border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-sky-500 dark:text-sky-400" /> All-Day Summary
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-bold uppercase">
              Prep
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {allDayPrep.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground dark:text-zinc-500 text-xs">
                No active items to prepare.
              </div>
            ) : (
              allDayPrep.map(([name, count]) => (
                <div
                  key={name}
                  className="flex justify-between items-center p-3 bg-white border border-black/5 dark:bg-black/20 dark:border-white/5 rounded-xl hover:border-black/10 dark:hover:border-black/10 dark:border-white/10 transition-colors"
                >
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{name}</span>
                  <span className="text-xs px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-black">
                    {count}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* KDS Settings Dialog overlay modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-zinc-50 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl text-zinc-900 dark:text-zinc-100 flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-400" /> KDS Display Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-black/5 bg-card rounded-lg text-muted-foreground hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Sound & Notifications Settings */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-extrabold text-sky-400 tracking-wider">
                  Audio & Sound Controls
                </h4>
                <div className="flex items-center justify-between p-4 bg-black/5 bg-card border border-black/5 dark:border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    {soundsEnabled ? (
                      <Volume2 className="w-5 h-5 text-green-400 animate-pulse" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-muted-foreground dark:text-zinc-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">Chime Alerts</p>
                      <p className="text-xs text-zinc-500 dark:text-muted-foreground">Play chiming sounds on ticket updates</p>
                    </div>
                  </div>
                  <button
                    onClick={() => saveSounds(!soundsEnabled)}
                    className={`text-xs px-4 py-2 font-bold rounded-lg border transition-all cursor-pointer ${
                      soundsEnabled
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-zinc-800 text-zinc-500 dark:text-muted-foreground border-zinc-700"
                    }`}
                  >
                    {soundsEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {soundsEnabled && (
                  <div className="p-4 bg-black/5 bg-card border border-black/5 dark:border-white/5 rounded-xl space-y-2">
                    <label className="text-xs font-semibold block text-zinc-700 dark:text-zinc-300">
                      Chime Volume: {Math.round(soundVolume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={soundVolume}
                      onChange={e => saveVolume(parseFloat(e.target.value))}
                      className="w-full accent-sky-400"
                    />
                  </div>
                )}
              </div>

              {/* Layout and Font controls */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-sky-400 tracking-wider">
                  Sizing & Density
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Text Size Toggle */}
                  <div className="p-4 bg-black/5 bg-card border border-black/5 dark:border-white/5 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Text Size</p>
                    <div className="flex bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-lg p-1 text-xs">
                      {(["sm", "md", "lg"] as const).map(sz => (
                        <button
                          key={sz}
                          onClick={() => saveTextSize(sz)}
                          className={`flex-1 text-center py-2 rounded-md font-bold transition-all cursor-pointer ${
                            textSize === sz ? "bg-black/10 dark:bg-white/10 text-white" : "text-zinc-500 dark:text-muted-foreground"
                          }`}
                        >
                          {sz === "sm" ? "Small" : sz === "md" ? "Medium" : "Large"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Density Toggle */}
                  <div className="p-4 bg-black/5 bg-card border border-black/5 dark:border-white/5 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Grid Layout Density</p>
                    <div className="flex bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-lg p-1 text-xs">
                      {(["compact", "standard", "spacious"] as const).map(den => (
                        <button
                          key={den}
                          onClick={() => saveDensity(den)}
                          className={`flex-1 text-center py-2 rounded-md font-bold transition-all cursor-pointer ${
                            density === den ? "bg-black/10 dark:bg-white/10 text-white" : "text-zinc-500 dark:text-muted-foreground"
                          }`}
                        >
                          {den === "compact" ? "Compact" : den === "standard" ? "Standard" : "Spacious"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 86'd / Inventory Availability Sub-Panel */}
              <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase font-extrabold text-sky-400 tracking-wider flex items-center gap-1.5">
                    <PackageX className="w-4 h-4 text-sky-400" /> Manage Unavailable (86'd) Items
                  </h4>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search menu items to 86..."
                    className="w-full bg-white/50 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  <Search className="w-4 h-4 text-muted-foreground dark:text-zinc-500 absolute left-3.5 top-3.5" />
                </div>

                <div className="border border-black/5 dark:border-white/5 rounded-xl max-h-48 overflow-y-auto p-2 bg-black/20 divide-y divide-white/5">
                  {filteredPosItems.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground dark:text-zinc-500 text-xs">
                      No matching POS items.
                    </div>
                  ) : (
                    filteredPosItems.map(item => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2.5 px-2 hover:bg-black/5 bg-card transition-colors"
                      >
                        <span className={`text-sm font-semibold ${item.is_sold_out ? "text-muted-foreground dark:text-zinc-500 line-through" : "text-zinc-900 dark:text-zinc-100"}`}>
                          {item.name}
                        </span>
                        <button
                          onClick={() => handleToggleSoldOut(item.id, item.is_sold_out)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            item.is_sold_out
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-black/5 bg-card text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:bg-black/10 dark:bg-white/10"
                          }`}
                        >
                          {item.is_sold_out ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Sold Out (86'd)
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" /> Available
                            </>
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
