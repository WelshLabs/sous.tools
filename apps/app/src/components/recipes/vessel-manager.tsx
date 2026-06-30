"use client";

import React, { useState, useEffect } from "react";
import { VesselProfile } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { Scale, Plus, Trash2, Edit3, Loader2, X } from "lucide-react";
import { VesselDialog } from "./vessel-dialog";
import { toast } from "sonner";

interface VesselManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VesselManager: React.FC<VesselManagerProps> = ({ isOpen, onClose }) => {
  const [vessels, setVessels] = useState<VesselProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeVessel, setActiveVessel] = useState<VesselProfile | null>(null);

  // User settings to toggle measurements and volume
  const [unitSystem, setUnitSystem] = useState<"cm" | "in">("cm");
  const [volumeUnit, setVolumeUnit] = useState<"ml" | "g">("ml");

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
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const response = await res.json();
        if (response.success) {
          const savedVessel = response.data;
          
          // Optimistically update the list view immediately
          setVessels(prev => {
            const exists = prev.some(v => v.id === savedVessel.id);
            if (exists) {
              return prev.map(v => v.id === savedVessel.id ? savedVessel : v);
            } else {
              return [...prev, savedVessel];
            }
          });
          
          toast.success(activeVessel ? "Vessel profile updated." : "Vessel profile added.");
          setDialogOpen(false);
          
          // Silently trigger background fetch to ensure perfect sync
          fetch("/api/recipes/vessels")
            .then(r => r.json())
            .then(p => {
              if (p.success) setVessels(p.data || []);
            })
            .catch(console.error);
        }
      } else {
        toast.error("Failed to save vessel profile.");
      }
    } catch (err: any) {
      toast.error(`Error saving vessel: ${err.message}`);
    }
  };

  const handleDeleteVessel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vessel profile?")) return;
    const res = await fetch(`/api/recipes/vessels/${id}`, { method: "DELETE" });
    if (res.ok) {
      setVessels(prev => prev.filter(v => v.id !== id));
      toast.success("Vessel profile deleted.");
      fetchVessels();
    }
  };

  if (!isOpen) return null;

  const formatDim = (val: number | null) => {
    if (val === null || val === undefined) return "-";
    if (unitSystem === "in") {
      return `${(val / 2.54).toFixed(1)} in`;
    }
    return `${val} cm`;
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm z-[40] animate-in fade-in cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 z-[45] w-full max-w-md bg-zinc-950/90 border-l border-black/10 dark:border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300 backdrop-blur-md">
        <header className="flex justify-between items-center p-5 border-b border-black/5 dark:border-white/5 bg-zinc-950/50">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-sky-400" /> Vessels Manager
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage pan capacities for vessel-aware scaling.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-black/5 dark:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Toggles Unit System Sub-Header */}
        <div className="flex gap-4 px-5 py-3 border-b border-black/5 dark:border-white/5 bg-zinc-950/30 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500">Dimensions:</span>
            <div className="flex bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded p-0.5">
              <button 
                onClick={() => setUnitSystem("cm")} 
                className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${unitSystem === "cm" ? "bg-black/10 dark:bg-white/10 text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300"}`}
              >
                CM
              </button>
              <button 
                onClick={() => setUnitSystem("in")} 
                className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${unitSystem === "in" ? "bg-black/10 dark:bg-white/10 text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300"}`}
              >
                IN
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500">Volume:</span>
            <div className="flex bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded p-0.5">
              <button 
                onClick={() => setVolumeUnit("ml")} 
                className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${volumeUnit === "ml" ? "bg-black/10 dark:bg-white/10 text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300"}`}
              >
                ML
              </button>
              <button 
                onClick={() => setVolumeUnit("g")} 
                className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${volumeUnit === "g" ? "bg-black/10 dark:bg-white/10 text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300"}`}
              >
                G
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <Button className="w-full mb-6" onClick={() => { setActiveVessel(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-1 inline" /> Add Vessel Profile
          </Button>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sky-400" /></div>
          ) : vessels.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No vessels configured. Click 'Add Vessel Profile' to get started.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {vessels.map((pan) => (
                <div key={pan.id} className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between shadow-lg hover:border-white/20 transition-all">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{pan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 capitalize">
                      Shape: {pan.shape.toLowerCase()}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Dimensions: {pan.shape === "RECTANGULAR" 
                        ? `${formatDim(pan.length)} x ${formatDim(pan.width)} x ${formatDim(pan.height)}` 
                        : `d: ${formatDim(pan.diameter)} x h: ${formatDim(pan.height)}`}
                    </p>
                    <div className="mt-2 text-xs font-semibold text-sky-400">{pan.volumeMl} {volumeUnit} Capacity</div>
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
      <VesselDialog 
        isOpen={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        onSave={handleSaveVessel} 
        vessel={activeVessel} 
        unitSystem={unitSystem}
        volumeUnit={volumeUnit}
      />
    </>
  );
};
