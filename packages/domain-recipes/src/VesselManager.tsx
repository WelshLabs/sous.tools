"use client";

import React, { useState } from "react";
import { VesselProfile } from "@soustools/api-types";
import { Button } from "@soustools/design-system";
import { Scale, Plus, Trash2, Edit3, Loader2, X } from "lucide-react";
import { VesselDialog } from "./VesselDialog";

/**
 * Props for the VesselManager component.
 */
export interface VesselManagerProps {
  /** Whether the drawer is open. */
  isOpen: boolean;
  /** Called when the drawer should close. */
  onClose: () => void;
  /** The list of vessels. */
  vessels: VesselProfile[];
  /** Whether vessels are loading. */
  loading?: boolean;
  /**
   * Called to save a vessel profile.
   * Resolves on success, rejects on failure (so Dialog can show error).
   */
  onSaveVessel: (
    vessel: Omit<VesselProfile, "id" | "organizationId" | "createdAt">,
    id?: string
  ) => Promise<void>;
  /** Called to delete a vessel profile. */
  onDeleteVessel: (id: string) => Promise<void>;
}

/**
 * VesselManager — a slide-out drawer for managing pan capacities and dimensions.
 *
 * Employs Neon-Glass `--color-card` and semantic styles.
 *
 * **Presentation boundary**: No fetching. Passes operations up via
 * `onSaveVessel` and `onDeleteVessel`.
 *
 * @tenant-docs-export
 * # VesselManager
 * ```tsx
 * import { VesselManager } from "@soustools/domain-recipes";
 *
 * <VesselManager
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   vessels={vessels}
 *   loading={loading}
 *   onSaveVessel={handleSave}
 *   onDeleteVessel={handleDelete}
 * />
 * ```
 */
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
    payload: Omit<VesselProfile, "id" | "organizationId" | "createdAt">
  ) => {
    await onSaveVessel(payload, activeVessel?.id);
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vessel profile?")) return;
    await onDeleteVessel(id);
  };

  const formatDim = (val: number | null) => {
    if (val === null || val === undefined) return "-";
    if (unitSystem === "in") {
      return `${(val / 2.54).toFixed(1)} in`;
    }
    return `${val} cm`;
  };

  const toggleBtnClass =
    "text-[10px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer";

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
              <Scale className="w-5 h-5" style={{ color: "var(--color-primary)" }} />{" "}
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

        {/* Toggles Unit System Sub-Header */}
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
                            pan.width
                          )} x ${formatDim(pan.height)}`
                        : `d: ${formatDim(pan.diameter)} x h: ${formatDim(
                            pan.height
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
                      onClick={() => handleDelete(pan.id)}
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

      <VesselDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveVesselInternal}
        vessel={activeVessel}
        unitSystem={unitSystem}
        volumeUnit={volumeUnit}
      />
    </>
  );
}
