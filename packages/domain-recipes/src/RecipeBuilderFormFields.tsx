"use client";

import type React from "react";
import type { VesselProfile } from "@soustools/api-types";

export interface RecipeBuilderFormFieldsProps {
  title: string;
  setTitle: (val: string) => void;
  yieldCount: number;
  setYieldCount: (val: number) => void;
  yieldUnit: string;
  setYieldUnit: (val: string) => void;
  vesselId: string;
  setVesselId: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  vessels: VesselProfile[];
}

export function RecipeBuilderFormFields({
  title,
  setTitle,
  yieldCount,
  setYieldCount,
  yieldUnit,
  setYieldUnit,
  vesselId,
  setVesselId,
  status,
  setStatus,
  vessels,
}: RecipeBuilderFormFieldsProps) {
  const labelStyle: React.CSSProperties = { color: "var(--color-muted-foreground)" };
  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1" style={labelStyle}>
            Recipe Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Traditional Sourdough Bread"
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={labelStyle}>
            Default Yield
          </label>
          <input
            type="number"
            step="any"
            min="0.01"
            value={yieldCount}
            onChange={(e) => setYieldCount(parseFloat(e.target.value) || 1)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={labelStyle}>
            Yield Unit
          </label>
          <input
            type="text"
            value={yieldUnit}
            onChange={(e) => setYieldUnit(e.target.value)}
            placeholder="e.g. loaves, portions"
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={labelStyle}>
          Default Vessel Profile (Optional)
        </label>
        <select
          value={vesselId}
          onChange={(e) => setVesselId(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={inputStyle}
        >
          <option value="">None (Standard Yield Scaling only)</option>
          {vessels.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.volumeMl} ml)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={labelStyle}>
          Recipe Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={inputStyle}
        >
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
    </>
  );
}
