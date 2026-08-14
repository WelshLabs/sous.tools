"use client";

import { useState } from "react";
import { type SignageBlock, type BlockSizing } from "@soustools/api-types";
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
        <label className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
          {label}
        </label>
        <button
          onClick={onLinkToggle}
          className="text-muted-foreground hover:text-cyan-400"
        >
          {linked ? (
            <Link2 className="h-3 w-3" />
          ) : (
            <Unlink className="h-3 w-3" />
          )}
        </button>
      </div>
      {linked ? (
        <input
          type="text"
          placeholder="e.g. 10px or 1rem"
          value={values[0]}
          onChange={(e) => onChange(0, e.target.value, true)}
          className="bg-card border-border text-foreground w-full rounded border px-2 py-1.5 text-xs placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
        />
      ) : (
        <div className="grid grid-cols-4 gap-1">
          {["T", "R", "B", "L"].map((dir, i) => (
            <div key={dir} className="relative">
              <span className="absolute top-1/2 left-1.5 -translate-y-1/2 text-[9px] font-bold text-zinc-600">
                {dir}
              </span>
              <input
                type="text"
                value={values[i]}
                onChange={(e) => onChange(i, e.target.value, false)}
                className="bg-card border-border text-foreground w-full rounded border py-1.5 pr-1 pl-4 text-xs focus:border-cyan-500 focus:outline-none"
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
          <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
            Width
          </label>
          <input
            type="text"
            placeholder="auto"
            value={sizing.width || ""}
            onChange={(e) => updateSizing({ width: e.target.value })}
            className="bg-card border-border text-foreground w-full rounded border px-2 py-1.5 text-xs"
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-[10px] uppercase">
            Height
          </label>
          <input
            type="text"
            placeholder="auto"
            value={sizing.height || ""}
            onChange={(e) => updateSizing({ height: e.target.value })}
            className="bg-card border-border text-foreground w-full rounded border px-2 py-1.5 text-xs"
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
