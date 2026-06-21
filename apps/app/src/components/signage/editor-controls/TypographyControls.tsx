"use client";

import React from "react";
import { SignageBlock } from "@soustools/api-types";

interface TypographyControlsProps {
  block: SignageBlock;
  onUpdate: (updates: Partial<SignageBlock>) => void;
}

export function TypographyControls({ block, onUpdate }: TypographyControlsProps) {
  const visuals = block.visuals || {};
  const typo = visuals.typography || {};

  const updateTypo = (updates: Partial<typeof typo>) => {
    onUpdate({ visuals: { ...visuals, typography: { ...typo, ...updates } } });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-zinc-500 uppercase block mb-1">Color</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={/^#[0-9A-Fa-f]{6}$/i.test(typo.color || "") ? typo.color : "#ffffff"} 
              onChange={(e) => updateTypo({ color: e.target.value })} 
              className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0" 
            />
            <input 
              type="text" 
              placeholder="Global Defaults" 
              value={typo.color || ""} 
              onChange={(e) => updateTypo({ color: e.target.value })} 
              className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-600" 
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase block mb-1">Font Size</label>
          <input 
            type="text" 
            placeholder="e.g. 24px or 2rem" 
            value={typo.fontSize || ""} 
            onChange={e => updateTypo({ fontSize: e.target.value })} 
            className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-zinc-500 uppercase block mb-1">Font Weight</label>
          <select 
            value={typo.fontWeight || ""} 
            onChange={e => updateTypo({ fontWeight: e.target.value })}
            className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-zinc-100"
          >
            <option value="">Default</option>
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="100">100 - Thin</option>
            <option value="300">300 - Light</option>
            <option value="500">500 - Medium</option>
            <option value="700">700 - Bold</option>
            <option value="900">900 - Black</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 uppercase block mb-1">Alignment</label>
          <select 
            value={typo.textAlign || ""} 
            onChange={e => updateTypo({ textAlign: e.target.value as any })}
            className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-zinc-100"
          >
            <option value="">Default</option>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="text-[10px] text-zinc-500 uppercase block mb-1">Font Family</label>
        <input 
          type="text" 
          list="google-fonts-list"
          placeholder="Global Default" 
          value={typo.fontFamily || ""} 
          onChange={e => updateTypo({ fontFamily: e.target.value })} 
          className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600" 
        />
      </div>
    </div>
  );
}
