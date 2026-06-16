"use client";

import React, { useState, useEffect } from "react";
import { SignageDisplay } from "@soustools/api-types";
import { Monitor } from "lucide-react";

interface DisplayPickerProps {
  deckId?: string;
}

interface RawDisplay {
  id: unknown;
  name: unknown;
  organization_id?: unknown;
  organizationId?: unknown;
  device_id?: unknown;
  deviceId?: unknown;
  port_label?: unknown;
  portLabel?: unknown;
  deck_id?: unknown;
  deckId?: unknown;
  last_seen_at?: unknown;
  lastSeenAt?: unknown;
  created_at?: unknown;
  createdAt?: unknown;
}

export const DisplayPicker: React.FC<DisplayPickerProps> = ({ deckId }) => {
  const [displays, setDisplays] = useState<SignageDisplay[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!deckId) return;
    fetch("/api/signage/displays")
      .then((r) => r.json())
      .then((d: { success: boolean; data: RawDisplay[] }) => {
        if (!d.success) return;
        const mapped: SignageDisplay[] = d.data.map((raw) => ({
          id: String(raw.id ?? ""),
          organizationId: String(raw.organization_id ?? raw.organizationId ?? ""),
          name: String(raw.name ?? ""),
          deviceId: (raw.device_id ?? raw.deviceId ?? null) as string | null,
          portLabel: (raw.port_label ?? raw.portLabel ?? null) as string | null,
          deckId: (raw.deck_id ?? raw.deckId ?? null) as string | null,
          lastSeenAt: (raw.last_seen_at ?? raw.lastSeenAt ?? null) as string | null,
          createdAt: String(raw.created_at ?? raw.createdAt ?? ""),
        }));
        setDisplays(mapped);
        setAssignedIds(new Set(mapped.filter((disp) => disp.deckId === deckId).map((disp) => disp.id)));
      })
      .catch(console.error);
  }, [deckId]);

  const handleToggle = async (displayId: string, checked: boolean): Promise<void> => {
    const res = await fetch(`/api/signage/displays/${displayId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId: checked ? deckId : null }),
    });
    const data = (await res.json()) as { success: boolean };
    if (data.success) {
      setAssignedIds((prev) => {
        const next = new Set(prev);
        checked ? next.add(displayId) : next.delete(displayId);
        return next;
      });
    }
  };

  if (!deckId || displays.length === 0) return null;

  return (
    <>
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1.5">
        <Monitor className="w-3 h-3" /> Assign Displays
      </p>
      <div className="space-y-1.5">
        {displays.map((disp) => (
          <label key={disp.id} className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={assignedIds.has(disp.id)}
              onChange={(e) => handleToggle(disp.id, e.target.checked)}
              className="accent-primary w-3.5 h-3.5" />
            <span className="text-xs text-zinc-300 group-hover:text-zinc-100 transition-colors">{disp.name}</span>
          </label>
        ))}
      </div>
    </>
  );
};
