"use client";

import { Save, X } from "lucide-react";
import type { Vendor } from "@soustools/api-types";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export interface VendorCardFormProps {
  form: Partial<Vendor>;
  setForm: (f: Partial<Vendor>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function VendorCardForm({
  form,
  setForm,
  onSave,
  onCancel,
}: VendorCardFormProps) {
  return (
    <div className="st-glass-panel flex flex-col gap-3 rounded-xl border border-sky-500/30 bg-sky-50/50 p-5 shadow-md dark:bg-sky-500/5">
      <input
        autoFocus
        type="text"
        placeholder="Vendor Name"
        value={form.name ?? ""}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="dark:border-border dark:text-foreground w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:ring-sky-500 focus:outline-none dark:bg-zinc-950"
      />
      <select
        value={form.order_method ?? "MANUAL"}
        onChange={(e) =>
          setForm({
            ...form,
            order_method: e.target.value as Vendor["order_method"],
          })
        }
        className="dark:border-border dark:text-foreground w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:ring-sky-500 focus:outline-none dark:bg-zinc-950"
      >
        <option value="" disabled>
          Select Order Method
        </option>
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
          className="dark:border-border dark:text-foreground w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:ring-sky-500 focus:outline-none dark:bg-zinc-950"
        />
      )}
      {form.order_method === "SMS" && (
        <input
          type="tel"
          placeholder="+1 555-555-5555"
          value={form.phone ?? ""}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="dark:border-border dark:text-foreground w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:ring-sky-500 focus:outline-none dark:bg-zinc-950"
        />
      )}
      <div className="mt-2">
        <span className="mb-2 block text-xs font-medium text-zinc-400 dark:text-zinc-500">
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
                className={`cursor-pointer rounded border px-2 py-1 text-xs transition-colors ${isSelected ? "text-foreground border-sky-500 bg-sky-500" : "dark:bg-card dark:border-border border-zinc-200 bg-white text-zinc-600 hover:border-sky-500 dark:text-zinc-400"}`}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>
      <div className="dark:border-border mt-2 flex gap-2 border-t border-zinc-200 pt-3">
        <button
          onClick={onSave}
          className="text-foreground flex flex-1 cursor-pointer items-center justify-center gap-1 rounded bg-sky-500 py-1.5 text-sm font-medium transition-colors hover:bg-sky-600"
        >
          <Save className="h-4 w-4" /> Save
        </button>
        <button
          onClick={onCancel}
          className="dark:text-foreground flex flex-1 cursor-pointer items-center justify-center gap-1 rounded bg-zinc-200 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/20"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  );
}
