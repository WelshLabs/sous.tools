"use client";

import React, { useState, useEffect } from "react";
import { VesselProfile } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { Scale, Plus, Trash2, Edit3, Loader2 } from "lucide-react";
import { VesselDialog } from "./vessel-dialog";

export const VesselManager: React.FC = () => {
  const [vessels, setVessels] = useState<VesselProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeVessel, setActiveVessel] = useState<VesselProfile | null>(null);

  const fetchVessels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipes/vessels");
      if (res.ok) {
        const payload = await res.json();
        if (payload.success) setVessels(payload.data || []);
      }
    } catch (err) {
      console.error("Failed to load vessels", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const handleSaveVessel = async (payload: Omit<VesselProfile, "id" | "organizationId" | "createdAt">) => {
    const method = activeVessel ? "PUT" : "POST";
    const url = activeVessel ? `/api/recipes/vessels/${activeVessel.id}` : "/api/recipes/vessels";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const response = await res.json();
      if (response.success) {
        fetchVessels();
        setDialogOpen(false);
      }
    }
  };

  const handleDeleteVessel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vessel profile?")) return;
    const res = await fetch(`/api/recipes/vessels/${id}`, { method: "DELETE" });
    if (res.ok) fetchVessels();
  };

  return (
    <div className="space-y-6 bg-[oklch(0.12_0.02_180)] p-6 rounded-2xl border border-[oklch(0.22_0.02_180)] text-slate-100 max-w-4xl mx-auto">
      <header className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" /> Vessels Manager
          </h2>
          <p className="text-xs text-slate-400">Manage pan capacities and dimensions for vessel-aware scaling.</p>
        </div>
        <Button size="sm" onClick={() => { setActiveVessel(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-1 inline" /> Add Vessel
        </Button>
      </header>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : vessels.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No vessels configured. Click 'Add Vessel' to get started.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vessels.map((pan) => (
            <div key={pan.id} className="p-4 rounded-xl bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)] flex items-center justify-between shadow-lg">
              <div>
                <h3 className="text-sm font-bold text-slate-200">{pan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 capitalize">
                  Shape: {pan.shape.toLowerCase()}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dimensions: {pan.shape === "RECTANGULAR" ? `${pan.length}x${pan.width}x${pan.height} cm` : `d: ${pan.diameter} x h: ${pan.height} cm`}
                </p>
                <div className="mt-2 text-xs font-semibold text-sky-400">{pan.volumeMl} ml Capacity</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setActiveVessel(pan); setDialogOpen(true); }} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors cursor-pointer">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteVessel(pan.id)} className="p-2 bg-red-950/20 hover:bg-red-900/30 rounded-lg text-red-400 transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <VesselDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSaveVessel} vessel={activeVessel} />
    </div>
  );
};
