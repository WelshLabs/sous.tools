"use client";

import React from "react";
import { useState, useEffect } from "react";
import { type VesselProfile } from "@soustools/api-types";
import { VesselDialogForm } from "./VesselDialogForm";
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
        <VesselDialogForm
          name={name}
          setName={setName}
          shape={shape}
          setShape={setShape}
          length={length}
          setLength={setLength}
          width={width}
          setWidth={setWidth}
          height={height}
          setHeight={setHeight}
          diameter={diameter}
          setDiameter={setDiameter}
          volumeMl={volumeMl}
          setVolumeMl={setVolumeMl}
          unitSystem={unitSystem}
          volumeUnit={volumeUnit}
          loading={loading}
          onAutoCalculate={handleAutoCalculate}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
