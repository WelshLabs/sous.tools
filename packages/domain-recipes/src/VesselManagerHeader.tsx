"use client";

import { Scale, X } from "lucide-react";

export interface VesselManagerHeaderProps {
  onClose: () => void;
  unitSystem: "cm" | "in";
  setUnitSystem: (val: "cm" | "in") => void;
  volumeUnit: "ml" | "g";
  setVolumeUnit: (val: "ml" | "g") => void;
}

export function VesselManagerHeader({
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
