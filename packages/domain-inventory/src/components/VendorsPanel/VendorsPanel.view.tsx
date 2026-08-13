"use client";

import { Plus, Trash, Edit2 } from "lucide-react";
import type { Vendor } from "@soustools/api-types";
import { TwoToneHeader } from "@soustools/design-system";
import { VendorCardForm } from "./VendorCardForm";

interface VendorsPanelViewProps {
  vendors: Vendor[];
  isEditing: string | null;
  setIsEditing: (id: string | null) => void;
  editForm: Partial<Vendor>;
  setEditForm: (form: Partial<Vendor>) => void;
  handleSave: (id: string) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  onAddVendorClick?: () => void;
}

export function VendorsPanelView({
  vendors,
  isEditing,
  setIsEditing,
  editForm,
  setEditForm,
  handleSave,
  handleDelete,
  onAddVendorClick,
}: VendorsPanelViewProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <TwoToneHeader
          title="Vendor Management"
          breadcrumb="Manage suppliers, ordering schedules, and contact methods."
        />
        <button
          onClick={() => {
            if (onAddVendorClick) onAddVendorClick();
            else {
              setIsEditing("new");
              setEditForm({ order_days: [], order_method: "MANUAL" });
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-foreground rounded-lg font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Add Vendor
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
                      {vendor.order_method?.toLowerCase() ?? "None set"}
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
