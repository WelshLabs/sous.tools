"use client";

import React, { useState, useEffect } from "react";
import { VesselProfile } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { Scale, Plus, Trash2, Edit3, Loader2, X } from "lucide-react";
import { VesselDialog } from "./vessel-dialog";

interface VesselManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VesselManager: React.FC<VesselManagerProps> = ({ isOpen, onClose }) => {
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
    if (isOpen) {
      fetchVessels();
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] animate-in fade-in cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 z-[45] w-full max-w-md bg-[oklch(0.12_0.02_180)] border-l border-[oklch(0.22_0.02_180)] shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
        <header className="flex justify-between items-center p-5 border-b border-white/5 bg-zinc-950/50">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" /> Vessels Manager
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage pan capacities for vessel-aware scaling.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <Button className="w-full mb-6" onClick={() => { setActiveVessel(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-1 inline" /> Add Vessel Profile
          </Button>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : vessels.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No vessels configured. Click 'Add Vessel Profile' to get started.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {vessels.map((pan) => (
                <div key={pan.id} className="p-4 rounded-xl bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)] flex items-center justify-between shadow-lg hover:border-slate-700 transition-colors">
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
                  <div className="flex gap-1">
                    <button onClick={() => { setActiveVessel(pan); setDialogOpen(true); }} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors cursor-pointer">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteVessel(pan.id)} className="p-2 bg-red-950/20 hover:bg-red-900/30 rounded-lg text-red-400 transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* The VesselDialog will render above this drawer because it has z-50 */}
      <VesselDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSaveVessel} vessel={activeVessel} />
    </>
  );
};
