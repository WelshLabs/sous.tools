"use client";

import { useState } from "react";
import { Plus, Trash, Edit2, Save, X } from "lucide-react";
import type { Vendor } from "@soustools/api-types";
import { TwoToneHeader } from "@soustools/design-system";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export interface VendorsPanelProps {
  vendors: Vendor[];
  onSave: (id: string, payload: Partial<Vendor>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function VendorsPanel({ vendors, onSave, onDelete }: VendorsPanelProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vendor>>({});

  const handleSave = async (id: string) => {
    if (!editForm.name) {
      alert("Vendor name is required");
      return;
    }

    await onSave(id, editForm);
    setIsEditing(null);
    setEditForm({});
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      await onDelete(id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <TwoToneHeader
          title="Vendor Management"
          breadcrumb="Manage suppliers, ordering schedules, and contact methods."
        />
        <button
          onClick={() => {
            setIsEditing("new");
            setEditForm({ order_days: [], order_method: "MANUAL" });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-foreground rounded-lg font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isEditing === "new" && (
          <VendorCardForm
            form={editForm}
            setForm={setEditForm}
            onSave={() => handleSave("new")}
            onCancel={() => setIsEditing(null)}
          />
        )}

        {vendors.map((vendor) =>
          isEditing === vendor.id ? (
            <VendorCardForm
              key={vendor.id}
              form={editForm}
              setForm={setEditForm}
              onSave={() => handleSave(vendor.id)}
              onCancel={() => setIsEditing(null)}
            />
          ) : (
            <div
              key={vendor.id}
              className="st-glass-panel p-5 rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-card shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-foreground">
                    {vendor.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setIsEditing(vendor.id);
                        setEditForm(vendor);
                      }}
                      className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-sky-500 rounded-md hover:bg-zinc-100 dark:hover:bg-black/5 dark:bg-card transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-red-500 rounded-md hover:bg-zinc-100 dark:hover:bg-black/5 dark:bg-card transition-colors cursor-pointer"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span className="font-medium text-zinc-400 dark:text-zinc-500">
                      Method:
                    </span>
                    <span className="capitalize">
                      {vendor.order_method?.toLowerCase() || "None set"}
                    </span>
                  </div>
                  {vendor.email && (
                    <div className="flex justify-between">
                      <span className="font-medium text-zinc-400 dark:text-zinc-500">
                        Email:
                      </span>
                      <span className="truncate ml-2">{vendor.email}</span>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex justify-between">
                      <span className="font-medium text-zinc-400 dark:text-zinc-500">
                        Phone:
                      </span>
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/5">
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 block mb-2">
                  Order Days
                </span>
                <div className="flex flex-wrap gap-1">
                  {vendor.order_days && vendor.order_days.length > 0 ? (
                    vendor.order_days.map((day) => (
                      <span
                        key={day}
                        className="px-2 py-0.5 text-xs rounded bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400"
                      >
                        {day.slice(0, 3)}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      No days scheduled
                    </span>
                  )}
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function VendorCardForm({ form, setForm, onSave, onCancel }: any) {
  return (
    <div className="st-glass-panel p-5 rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-500/5 shadow-md flex flex-col gap-3">
      <input
        autoFocus
        type="text"
        placeholder="Vendor Name"
        value={form.name || ""}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-border rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
      />

      <select
        value={form.order_method || "MANUAL"}
        onChange={(e) => setForm({ ...form, order_method: e.target.value })}
        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-border rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
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
          value={form.email || ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-border rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      )}

      {form.order_method === "SMS" && (
        <input
          type="tel"
          placeholder="+1 555-555-5555"
          value={form.phone || ""}
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
                  const current = form.order_days || [];
                  setForm({
                    ...form,
                    order_days: isSelected
                      ? current.filter((d: string) => d !== day)
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
