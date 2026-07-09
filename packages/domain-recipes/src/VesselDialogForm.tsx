"use client";

import type React from "react";
import { Button } from "@soustools/design-system";

export interface VesselDialogFormProps {
  name: string;
  setName: (v: string) => void;
  shape: "ROUND" | "RECTANGULAR";
  setShape: (v: "ROUND" | "RECTANGULAR") => void;
  length: string;
  setLength: (v: string) => void;
  width: string;
  setWidth: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  diameter: string;
  setDiameter: (v: string) => void;
  volumeMl: string;
  setVolumeMl: (v: string) => void;
  unitSystem: "cm" | "in";
  volumeUnit: "ml" | "g";
  loading: boolean;
  onAutoCalculate: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function VesselDialogForm({
  name,
  setName,
  shape,
  setShape,
  length,
  setLength,
  width,
  setWidth,
  height,
  setHeight,
  diameter,
  setDiameter,
  volumeMl,
  setVolumeMl,
  unitSystem,
  volumeUnit,
  loading,
  onAutoCalculate,
  onSubmit,
  onCancel,
}: VesselDialogFormProps) {
  const labelStyle: React.CSSProperties = {
    color: "var(--color-muted-foreground)",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          onChange={(e) => setShape(e.target.value as "ROUND" | "RECTANGULAR")}
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
          onClick={onAutoCalculate}
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
          onClick={onCancel}
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
  );
}
