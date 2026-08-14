/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { type VesselProfile } from "@soustools/api-types";
import { VesselManagerView } from "./VesselManager.view";

export interface VesselManagerProps {
  isOpen: boolean;
  onClose: () => void;
  vessels: VesselProfile[];
  loading?: boolean;
  onSaveVessel: (
    vessel: Omit<VesselProfile, "id" | "organizationId" | "createdAt">,
    id?: string,
  ) => Promise<void>;
  onDeleteVessel: (id: string) => Promise<void>;
}

export function VesselManager({
  isOpen,
  onClose,
  vessels,
  loading = false,
  onSaveVessel,
  onDeleteVessel,
}: VesselManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeVessel, setActiveVessel] = useState<VesselProfile | null>(null);

  const [unitSystem, setUnitSystem] = useState<"cm" | "in">("cm");
  const [volumeUnit, setVolumeUnit] = useState<"ml" | "g">("ml");

  if (!isOpen) return null;

  const handleSaveVesselInternal = async (
    payload: Omit<VesselProfile, "id" | "organizationId" | "createdAt">,
  ) => {
    await onSaveVessel(payload, activeVessel?.id);
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vessel profile?"))
      return;
    await onDeleteVessel(id);
  };

  return (
    <VesselManagerView
      isOpen={isOpen}
      onClose={onClose}
      vessels={vessels}
      loading={loading}
      dialogOpen={dialogOpen}
      setDialogOpen={setDialogOpen}
      activeVessel={activeVessel}
      setActiveVessel={setActiveVessel}
      unitSystem={unitSystem}
      setUnitSystem={setUnitSystem}
      volumeUnit={volumeUnit}
      setVolumeUnit={setVolumeUnit}
      onSaveVessel={handleSaveVesselInternal}
      onDeleteVessel={handleDelete}
    />
  );
}

export interface VesselDialogContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    vessel: Omit<VesselProfile, "id" | "organizationId" | "createdAt">,
  ) => Promise<void>;
  vessel?: VesselProfile | null;
  unitSystem?: "cm" | "in";
  volumeUnit?: "ml" | "g";
  renderView: (props: any) => React.ReactNode;
}

export function VesselDialogContainer({
  isOpen,
  onClose,
  onSave,
  vessel,
  unitSystem = "cm",
  volumeUnit = "ml",
  renderView,
}: VesselDialogContainerProps) {
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
        setVolumeMl(Math.round(Math.PI * radius ** 2 * h).toString());
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

  return renderView({
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
    onAutoCalculate: handleAutoCalculate,
    onSubmit: handleSubmit,
  });
}
