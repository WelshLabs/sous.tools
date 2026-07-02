"use client";

import React, { useState, useEffect } from "react";
import { VesselProfile } from "@soustools/api-types";
import { Button } from "@soustools/design-system";
import { X } from "lucide-react";

/**
 * Props for the VesselDialog component.
 */
export interface VesselDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Called when the dialog is dismissed. */
  onClose: () => void;
  /** Called when the form is submitted. */
  onSave: (
    vessel: Omit<VesselProfile, "id" | "organizationId" | "createdAt">
  ) => Promise<void>;
  /** The vessel to edit. If null, creates a new vessel. */
  vessel?: VesselProfile | null;
  /** Display unit system. */
  unitSystem?: "cm" | "in";
  /** Volume unit. */
  volumeUnit?: "ml" | "g";
}

/**
 * VesselDialog — a modal form for creating or editing vessel profiles.
 *
 * Uses the Neon-Glass `--color-card` surface and semantic styling.
 * Purely presentational.
 *
 * @tenant-docs-export
 * # VesselDialog
 * ```tsx
 * import { VesselDialog } from "@soustools/domain-recipes";
 *
 * <VesselDialog
 *   isOpen={dialogOpen}
 *   onClose={() => setDialogOpen(false)}
 *   onSave={handleSaveVessel}
 *   vessel={activeVessel}
 * />
 * ```
 */
export function VesselDialog({
  isOpen,
  onClose,
  onSave,
  vessel,
  unitSystem = "cm",
  volumeUnit = "ml",
}: VesselDialogProps) {
  const [name, setName] = useState("");
  const [shape, setShape] = useState<"ROUND" | "RECTANGULAR">("RECTANGULAR");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [diameter, setDiameter] = useState("");
  const [volumeMl, setVolumeMl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fromCm = (val: number | null | undefined) => {
      if (val === null || val === undefined) return "";
      if (unitSystem === "in") {
        return parseFloat((val / 2.54).toFixed(2)).toString();
      }
        return val.toString();
    };

    if (vessel) {
      setName(vessel.name);
      setShape(vessel.shape);
      setLength(fromCm(vessel.length));
      setWidth(fromCm(vessel.width));
      setHeight(fromCm(vessel.height));
      setDiameter(fromCm(vessel.diameter));
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
  }, [vessel, isOpen, unitSystem]);

  const handleAutoCalculate = () => {
    const toCm = (val: string) => {
      const num = parseFloat(val) || 0;
      if (unitSystem === "in") {
        return num * 2.54;
      }
      return num;
    };

    const h = toCm(height);
    if (shape === "RECTANGULAR") {
      const l = toCm(length);
      const w = toCm(width);
      if (l && w && h) setVolumeMl(Math.round(l * w * h).toString());
    } else {
      const d = toCm(diameter);
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

    const toCm = (val: string) => {
      const num = parseFloat(val);
      if (isNaN(num)) return null;
      if (unitSystem === "in") {
        return num * 2.54;
      }
      return num;
    };

    try {
      await onSave({
        name,
        shape,
        length: shape === "RECTANGULAR" ? toCm(length) : null,
        width: shape === "RECTANGULAR" ? toCm(width) : null,
        height: toCm(height),
        diameter: shape === "ROUND" ? toCm(diameter) : null,
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

  const labelStyle: React.CSSProperties = {
    color: "var(--color-muted-foreground)",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgb(0 0 0 / 0.70)" }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          color: "var(--color-foreground)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors cursor-pointer"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold mb-4">
          {vessel ? "Edit Vessel Profile" : "Add Vessel Profile"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={labelStyle}>
              Vessel Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 9'' Pullman Pan"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={labelStyle}>
              Pan Shape
            </label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as any)}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            >
              <option value="RECTANGULAR">Rectangular / Square</option>
              <option value="ROUND">Round</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {shape === "RECTANGULAR" ? (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1" style={labelStyle}>
                    Length ({unitSystem})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="Length"
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={labelStyle}>
                    Width ({unitSystem})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="Width"
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium mb-1" style={labelStyle}>
                  Diameter ({unitSystem})
                </label>
                <input
                  type="number"
                  step="any"
                  value={diameter}
                  onChange={(e) => setDiameter(e.target.value)}
                  placeholder="Diameter"
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1" style={labelStyle}>
                Depth/Height ({unitSystem})
              </label>
              <input
                type="number"
                step="any"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Height"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={labelStyle}>
                Volume Capacity ({volumeUnit})
              </label>
              <input
                type="number"
                value={volumeMl}
                onChange={(e) => setVolumeMl(e.target.value)}
                placeholder={volumeUnit}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
                required
              />
            </div>
            <button
              type="button"
              onClick={handleAutoCalculate}
              className="text-xs px-3 py-2.5 rounded-lg transition-colors cursor-pointer font-semibold border"
              style={{
                backgroundColor: "var(--color-secondary)",
                borderColor: "var(--color-border)",
                color: "var(--color-primary)",
              }}
            >
              Auto-Calc Volume
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-foreground)",
              }}
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Vessel"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
