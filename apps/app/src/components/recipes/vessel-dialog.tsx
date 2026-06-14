"use client";

import React, { useState, useEffect } from "react";
import { VesselProfile } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { X } from "lucide-react";

interface VesselDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vessel: Omit<VesselProfile, "id" | "organizationId" | "createdAt">) => Promise<void>;
  vessel?: VesselProfile | null;
}

export const VesselDialog: React.FC<VesselDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  vessel,
}) => {
  const [name, setName] = useState("");
  const [shape, setShape] = useState<"ROUND" | "RECTANGULAR">("RECTANGULAR");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [diameter, setDiameter] = useState("");
  const [volumeMl, setVolumeMl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vessel) {
      setName(vessel.name);
      setShape(vessel.shape);
      setLength(vessel.length?.toString() || "");
      setWidth(vessel.width?.toString() || "");
      setHeight(vessel.height?.toString() || "");
      setDiameter(vessel.diameter?.toString() || "");
      setVolumeMl(vessel.volumeMl.toString());
    } else {
      setName("");
      setShape("RECTANGULAR");
      setLength("");
      setWidth("");
      setHeight("");
      setDiameter("");
      setVolumeMl("");
    }
  }, [vessel, isOpen]);

  // Auto-calculate volume based on dimensions (cm -> ml)
  const handleAutoCalculate = () => {
    const h = parseFloat(height) || 0;
    if (shape === "RECTANGULAR") {
      const l = parseFloat(length) || 0;
      const w = parseFloat(width) || 0;
      if (l && w && h) setVolumeMl(Math.round(l * w * h).toString());
    } else {
      const d = parseFloat(diameter) || 0;
      if (d && h) {
        const radius = d / 2;
        setVolumeMl(Math.round(Math.PI * (radius ** 2) * h).toString());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !volumeMl) return;
    setLoading(true);
    try {
      await onSave({
        name,
        shape,
        length: shape === "RECTANGULAR" ? (parseFloat(length) || null) : null,
        width: shape === "RECTANGULAR" ? (parseFloat(width) || null) : null,
        height: parseFloat(height) || null,
        diameter: shape === "ROUND" ? (parseFloat(diameter) || null) : null,
        volumeMl: parseFloat(volumeMl) || 0,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold mb-4">{vessel ? "Edit Vessel Profile" : "Add Vessel Profile"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Vessel Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 9'' Pullman Pan" className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Pan Shape</label>
            <select value={shape} onChange={(e) => setShape(e.target.value as any)} className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none">
              <option value="RECTANGULAR">Rectangular / Square</option>
              <option value="ROUND">Round</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {shape === "RECTANGULAR" ? (
              <>
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Length (cm)</label>
                  <input type="number" step="any" value={length} onChange={(e) => setLength(e.target.value)} placeholder="Length" className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Width (cm)</label>
                  <input type="number" step="any" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="Width" className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Diameter (cm)</label>
                <input type="number" step="any" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="Diameter" className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Depth/Height (cm)</label>
              <input type="number" step="any" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Height" className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 font-medium mb-1">Volume Capacity (ml)</label>
              <input type="number" value={volumeMl} onChange={(e) => setVolumeMl(e.target.value)} placeholder="ml" className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" required />
            </div>
            <button type="button" onClick={handleAutoCalculate} className="bg-zinc-800 hover:bg-zinc-700 text-sky-400 text-xs px-3 py-2.5 rounded-lg border border-white/5 transition-colors cursor-pointer font-semibold">
              Auto-Calc Volume
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer">Cancel</button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Vessel"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
