"use client";

import React, { useState } from "react";
import { SignageBlock, BlockSizing } from "@soustools/api-types";
import { Link2, Unlink } from "lucide-react";

interface LayoutControlsProps {
  block: SignageBlock;
  onUpdate: (updates: Partial<SignageBlock>) => void;
}

export function LayoutControls({ block, onUpdate }: LayoutControlsProps) {
  const sizing = block.sizing || {};
  const [paddingLinked, setPaddingLinked] = useState(true);
  const [marginLinked, setMarginLinked] = useState(true);

  const updateSizing = (updates: Partial<BlockSizing>) => {
    onUpdate({ sizing: { ...sizing, ...updates } });
  };

  const parseSpacing = (
    spacingStr: string | undefined,
  ): [string, string, string, string] => {
    if (!spacingStr) return ["", "", "", ""];
    const parts = spacingStr.split(" ").filter(Boolean);
    if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
    if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
    if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
    if (parts.length === 4) return [parts[0], parts[1], parts[2], parts[3]];
    return ["", "", "", ""];
  };

  const pad = parseSpacing(sizing.padding);
  const mar = parseSpacing(sizing.margin);

  const handleSpacingChange = (
    type: "padding" | "margin",
    idx: number,
    value: string,
    linked: boolean,
    currentArr: [string, string, string, string],
  ) => {
    const newArr = [...currentArr] as [string, string, string, string];
    if (linked) {
      newArr.fill(value);
    } else {
      newArr[idx] = value;
    }
    const val = newArr.every((v) => v === newArr[0])
      ? newArr[0]
      : newArr.join(" ");
    updateSizing({ [type]: val });
  };

  const SpacingControl = ({
    label,
    values,
    linked,
    onLinkToggle,
    onChange,
  }: {
    label: string;
    values: [string, string, string, string];
    linked: boolean;
    onLinkToggle: () => void;
    onChange: (idx: number, val: string, isLinked: boolean) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          {label}
        </label>
        <button
          onClick={onLinkToggle}
          className="text-zinc-400 dark:text-zinc-500 hover:text-cyan-400"
        >
          {linked ? (
            <Link2 className="w-3 h-3" />
          ) : (
            <Unlink className="w-3 h-3" />
          )}
        </button>
      </div>
      {linked ? (
        <input
          type="text"
          placeholder="e.g. 10px or 1rem"
          value={values[0]}
          onChange={(e) => onChange(0, e.target.value, true)}
          className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
        />
      ) : (
        <div className="grid grid-cols-4 gap-1">
          {["T", "R", "B", "L"].map((dir, i) => (
            <div key={dir} className="relative">
              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-600 font-bold">
                {dir}
              </span>
              <input
                type="text"
                value={values[i]}
                onChange={(e) => onChange(i, e.target.value, false)}
                className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded pl-4 pr-1 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">
            Width
          </label>
          <input
            type="text"
            placeholder="auto"
            value={sizing.width || ""}
            onChange={(e) => updateSizing({ width: e.target.value })}
            className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">
            Height
          </label>
          <input
            type="text"
            placeholder="auto"
            value={sizing.height || ""}
            onChange={(e) => updateSizing({ height: e.target.value })}
            className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <SpacingControl
        label="Padding"
        values={pad}
        linked={paddingLinked}
        onLinkToggle={() => setPaddingLinked(!paddingLinked)}
        onChange={(idx, val, linked) =>
          handleSpacingChange("padding", idx, val, linked, pad)
        }
      />

      <SpacingControl
        label="Margin"
        values={mar}
        linked={marginLinked}
        onLinkToggle={() => setMarginLinked(!marginLinked)}
        onChange={(idx, val, linked) =>
          handleSpacingChange("margin", idx, val, linked, mar)
        }
      />
    </div>
  );
}
