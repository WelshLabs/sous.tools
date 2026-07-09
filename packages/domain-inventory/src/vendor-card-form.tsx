"use client";

import { Save, X } from "lucide-react";
import type { Vendor } from "@soustools/api-types";

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

export interface VendorCardFormProps {
  form: Partial<Vendor>;
  setForm: (f: Partial<Vendor>) => void;
  onSave: () => void;
  onCancel: () => void;
}

/** Molecule: Inline form card for creating or editing a vendor record. */
export function VendorCardForm({ form, setForm, onSave, onCancel }: VendorCardFormProps) {
  return (
    <div className="st-glass-panel p-5 rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-500/5 shadow-md flex flex-col gap-3">
      <input
        autoFocus
        type="text"
        placeholder="Vendor Name"
        value={form.name ?? ""}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-border rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
      />

      <select
        value={form.order_method ?? "MANUAL"}
        onChange={(e) => setForm({ ...form, order_method: e.target.value as any })}

        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-border rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <option value="" disabled>Select Order Method</option>
        <option value="EMAIL">Email</option>
        <option value="SMS">Text Message</option>
        <option value="MANUAL">Manual</option>
      </select>

      {form.order_method === "EMAIL" && (
        <input
          type="email"
          placeholder="vendor@example.com"
          value={form.email ?? ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-border rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      )}

      {form.order_method === "SMS" && (
        <input
          type="tel"
          placeholder="+1 555-555-5555"
          value={form.phone ?? ""}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-border rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      )}

      <div className="mt-2">
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 block mb-2">
          Select Order Days
        </span>
        <div className="flex flex-wrap gap-1.5">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = form.order_days?.includes(day);
            return (
              <button
                key={day}
                onClick={() => {
                  const current = form.order_days ?? [];
                  setForm({
                    ...form,
                    order_days: isSelected
                      ? current.filter((d) => d !== day)
                      : [...current, day],
                  });
                }}
                className={`px-2 py-1 text-xs rounded transition-colors border cursor-pointer ${
                  isSelected
                    ? "bg-sky-500 border-sky-500 text-foreground"
                    : "bg-white dark:bg-card border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-400 hover:border-sky-500"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 mt-2 pt-3 border-t border-zinc-200 dark:border-border">
        <button
          onClick={onSave}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-sky-500 hover:bg-sky-600 text-foreground rounded font-medium transition-colors text-sm cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-zinc-900 dark:text-foreground rounded font-medium transition-colors text-sm cursor-pointer"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
}
