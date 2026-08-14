/* eslint-disable max-lines */

"use client";

import React from "react";
import { type VesselProfile } from "@soustools/api-types";
import { Button } from "@soustools/design-system";
import { Plus, Trash2, Edit3, Loader2, Scale, X } from "lucide-react";
import { VesselDialogContainer } from "./VesselManager.container";

// --- VesselManager Header View ---

export interface VesselManagerHeaderProps {
  onClose: () => void;
  unitSystem: "cm" | "in";
  setUnitSystem: (val: "cm" | "in") => void;
  volumeUnit: "ml" | "g";
  setVolumeUnit: (val: "ml" | "g") => void;
}

export function VesselManagerHeaderView({
  onClose,
  unitSystem,
  setUnitSystem,
  volumeUnit,
  setVolumeUnit,
}: VesselManagerHeaderProps) {
  const toggleBtnClass =
    "text-[10px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer";

  return (
    <>
      <header
        className="flex justify-between items-center p-5 border-b"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "rgb(15 23 42 / 0.50)",
        }}
      >
        <div>
          <h2
            className="text-lg font-bold flex items-center gap-2"
            style={{ color: "var(--color-foreground)" }}
          >
            <Scale
              className="w-5 h-5"
              style={{ color: "var(--color-primary)" }}
            />{" "}
            Vessels Manager
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Manage pan capacities for vessel-aware scaling.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/5"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div
        className="flex gap-4 px-5 py-3 border-b text-xs"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "rgb(15 23 42 / 0.30)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] uppercase font-bold"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Dimensions:
          </span>
          <div
            className="flex rounded p-0.5"
            style={{
              backgroundColor: "var(--color-input)",
              border: "1px solid var(--color-border)",
            }}
          >
            <button
              onClick={() => setUnitSystem("cm")}
              className={`${toggleBtnClass} ${
                unitSystem === "cm"
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              CM
            </button>
            <button
              onClick={() => setUnitSystem("in")}
              className={`${toggleBtnClass} ${
                unitSystem === "in"
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              IN
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-[10px] uppercase font-bold"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Volume:
          </span>
          <div
            className="flex rounded p-0.5"
            style={{
              backgroundColor: "var(--color-input)",
              border: "1px solid var(--color-border)",
            }}
          >
            <button
              onClick={() => setVolumeUnit("ml")}
              className={`${toggleBtnClass} ${
                volumeUnit === "ml"
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              ML
            </button>
            <button
              onClick={() => setVolumeUnit("g")}
              className={`${toggleBtnClass} ${
                volumeUnit === "g"
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              G
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Dialog Form Input Views ---

const labelStyle: React.CSSProperties = {
  color: "var(--color-muted-foreground)",
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--color-input)",
  border: "1px solid var(--color-border)",
  color: "var(--color-foreground)",
};

interface VesselNameInputProps {
  name: string;
  setName: (v: string) => void;
}
function VesselNameInput({ name, setName }: VesselNameInputProps) {
  return (
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
  );
}

interface VesselShapeInputProps {
  shape: "ROUND" | "RECTANGULAR";
  setShape: (v: "ROUND" | "RECTANGULAR") => void;
}
function VesselShapeInput({ shape, setShape }: VesselShapeInputProps) {
  return (
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
  );
}

interface DimensionInputsProps {
  shape: "ROUND" | "RECTANGULAR";
  unitSystem: "cm" | "in";
  length: string;
  setLength: (v: string) => void;
  width: string;
  setWidth: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  diameter: string;
  setDiameter: (v: string) => void;
}
function DimensionInputs({
  shape,
  unitSystem,
  length,
  setLength,
  width,
  setWidth,
  height,
  setHeight,
  diameter,
  setDiameter,
}: DimensionInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {shape === "RECTANGULAR" ? (
        <>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={labelStyle}
            >
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
            <label
              className="block text-xs font-medium mb-1"
              style={labelStyle}
            >
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
  );
}

interface VolumeInputProps {
  volumeMl: string;
  setVolumeMl: (v: string) => void;
  volumeUnit: "ml" | "g";
  onAutoCalculate: () => void;
}
function VolumeInput({
  volumeMl,
  setVolumeMl,
  volumeUnit,
  onAutoCalculate,
}: VolumeInputProps) {
  return (
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
  );
}

// --- Vessel Dialog View ---

export function VesselDialogView({
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
  loading,
  unitSystem,
  volumeUnit,
  vessel,
  onClose,
  onAutoCalculate,
  onSubmit,
}: any) {
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
        <form onSubmit={onSubmit} className="space-y-4">
          <VesselNameInput name={name} setName={setName} />
          <VesselShapeInput shape={shape} setShape={setShape} />
          <DimensionInputs
            shape={shape}
            unitSystem={unitSystem}
            length={length}
            setLength={setLength}
            width={width}
            setWidth={setWidth}
            height={height}
            setHeight={setHeight}
            diameter={diameter}
            setDiameter={setDiameter}
          />
          <VolumeInput
            volumeMl={volumeMl}
            setVolumeMl={setVolumeMl}
            volumeUnit={volumeUnit}
            onAutoCalculate={onAutoCalculate}
          />
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

// --- Main VesselManager View ---

export interface VesselManagerViewProps {
  isOpen: boolean;
  onClose: () => void;
  vessels: VesselProfile[];
  loading?: boolean;
  dialogOpen: boolean;
  setDialogOpen: (v: boolean) => void;
  activeVessel: VesselProfile | null;
  setActiveVessel: (v: VesselProfile | null) => void;
  unitSystem: "cm" | "in";
  setUnitSystem: (v: "cm" | "in") => void;
  volumeUnit: "ml" | "g";
  setVolumeUnit: (v: "ml" | "g") => void;
  onSaveVessel: (v: any) => Promise<void>;
  onDeleteVessel: (id: string) => Promise<void>;
}

export function VesselManagerView({
  onClose,
  vessels,
  loading = false,
  dialogOpen,
  setDialogOpen,
  activeVessel,
  setActiveVessel,
  unitSystem,
  setUnitSystem,
  volumeUnit,
  setVolumeUnit,
  onSaveVessel,
  onDeleteVessel,
}: VesselManagerViewProps) {
  const formatDim = (val: number | null) => {
    if (val === null || val === undefined) return "-";
    if (unitSystem === "in") {
      return `${(val / 2.54).toFixed(1)} in`;
    }
    return `${val} cm`;
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[40] animate-in fade-in cursor-pointer backdrop-blur-sm"
        style={{ backgroundColor: "rgb(0 0 0 / 0.60)" }}
        onClick={onClose}
      />

      <div
        className="fixed inset-y-0 right-0 z-[45] w-full max-w-md shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300 backdrop-blur-md"
        style={{
          backgroundColor: "rgb(15 23 42 / 0.90)",
          borderLeft: "1px solid var(--color-border)",
        }}
      >
        <VesselManagerHeaderView
          onClose={onClose}
          unitSystem={unitSystem}
          setUnitSystem={setUnitSystem}
          volumeUnit={volumeUnit}
          setVolumeUnit={setVolumeUnit}
        />

        <div className="flex-1 overflow-y-auto p-5">
          <Button
            className="w-full mb-6"
            onClick={() => {
              setActiveVessel(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1 inline" /> Add Vessel Profile
          </Button>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: "var(--color-primary)" }}
              />
            </div>
          ) : vessels.length === 0 ? (
            <div
              className="text-center py-12 text-sm"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              No vessels configured. Click 'Add Vessel Profile' to get started.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {vessels.map((pan) => (
                <div
                  key={pan.id}
                  className="p-4 rounded-xl border flex items-center justify-between shadow-lg transition-all"
                  style={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div>
                    <h3
                      className="text-sm font-bold"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      {pan.name}
                    </h3>
                    <p
                      className="text-xs mt-1 capitalize"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Shape: {pan.shape.toLowerCase()}
                    </p>
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Dimensions:{" "}
                      {pan.shape === "RECTANGULAR"
                        ? `${formatDim(pan.length)} x ${formatDim(
                            pan.width,
                          )} x ${formatDim(pan.height)}`
                        : `d: ${formatDim(pan.diameter)} x h: ${formatDim(
                            pan.height,
                          )}`}
                    </p>
                    <div
                      className="mt-2 text-xs font-semibold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {pan.volumeMl} {volumeUnit} Capacity
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setActiveVessel(pan);
                        setDialogOpen(true);
                      }}
                      className="p-2 rounded-lg transition-colors cursor-pointer"
                      style={{
                        backgroundColor: "var(--color-secondary)",
                        color: "var(--color-foreground)",
                      }}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteVessel(pan.id)}
                      className="p-2 rounded-lg transition-colors cursor-pointer"
                      style={{
                        backgroundColor: "rgb(244 63 94 / 0.10)",
                        color: "var(--color-destructive)",
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <VesselDialogContainer
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={onSaveVessel}
        vessel={activeVessel}
        unitSystem={unitSystem}
        volumeUnit={volumeUnit}
        renderView={(props) => <VesselDialogView {...props} />}
      />
    </>
  );
}
