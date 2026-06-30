"use client";

import React from "react";
import { SignageBlock } from "@soustools/api-types";

interface BorderControlsProps {
  block: SignageBlock;
  onUpdate: (updates: Partial<SignageBlock>) => void;
}

export function BorderControls({ block, onUpdate }: BorderControlsProps) {
  const visuals = block.visuals || {};
  const border = visuals.border || {};
  const shadow = visuals.shadow || {};

  const updateBorder = (updates: Partial<typeof border>) => {
    onUpdate({ visuals: { ...visuals, border: { ...border, ...updates } } });
  };

  const updateShadow = (updates: Partial<typeof shadow>) => {
    onUpdate({ visuals: { ...visuals, shadow: { ...shadow, ...updates } } });
  };

  return (
    <div className="space-y-4">
      {/* Border Settings */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block border-b border-black/5 dark:border-white/5 pb-1">Border</label>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={/^#[0-9A-Fa-f]{6}$/i.test(border.color || "") ? border.color : "#ffffff"} 
                onChange={(e) => updateBorder({ color: e.target.value })} 
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0" 
              />
              <input 
                type="text" 
                placeholder="None" 
                value={border.color || ""} 
                onChange={(e) => updateBorder({ color: e.target.value })} 
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600" 
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Style</label>
            <select 
              value={border.style || ""} 
              onChange={e => updateBorder({ style: e.target.value as any })}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
            >
              <option value="">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Width</label>
            <input 
              type="text" 
              placeholder="e.g. 1px" 
              value={border.width || ""} 
              onChange={e => updateBorder({ width: e.target.value })} 
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600" 
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Radius</label>
            <input 
              type="text" 
              placeholder="e.g. 8px" 
              value={border.radius || ""} 
              onChange={e => updateBorder({ radius: e.target.value })} 
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600" 
            />
          </div>
        </div>
      </div>

      {/* Shadow Settings */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block border-b border-black/5 dark:border-white/5 pb-1">Shadow</label>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">X Offset</label>
            <input type="text" placeholder="0px" value={shadow.x || ""} onChange={e => updateShadow({ x: e.target.value })} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Y Offset</label>
            <input type="text" placeholder="4px" value={shadow.y || ""} onChange={e => updateShadow({ y: e.target.value })} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Blur</label>
            <input type="text" placeholder="10px" value={shadow.blur || ""} onChange={e => updateShadow({ blur: e.target.value })} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">Color</label>
            <input type="text" placeholder="rgba(0,0,0,0.5)" value={shadow.color || ""} onChange={e => updateShadow({ color: e.target.value })} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
