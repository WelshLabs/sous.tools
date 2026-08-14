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
    <div className="animate-in fade-in mx-auto max-w-5xl space-y-6">
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
          className="text-foreground flex cursor-pointer items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 font-medium transition-colors hover:bg-sky-600"
        >
          <Plus className="h-5 w-5" /> Add Vendor
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              className="st-glass-panel dark:bg-card flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/5"
            >
              <div>
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="dark:text-foreground text-lg font-semibold text-zinc-900">
                    {vendor.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setIsEditing(vendor.id);
                        setEditForm(vendor);
                      }}
                      className="dark:bg-card cursor-pointer rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-sky-500 dark:text-zinc-400 dark:hover:bg-black/5"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="dark:bg-card cursor-pointer rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:text-zinc-400 dark:hover:bg-black/5"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
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
                      <span className="ml-2 truncate">{vendor.email}</span>
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
              <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-white/5">
                <span className="mb-2 block text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  Order Days
                </span>
                <div className="flex flex-wrap gap-1">
                  {vendor.order_days && vendor.order_days.length > 0 ? (
                    vendor.order_days.map((day) => (
                      <span
                        key={day}
                        className="rounded bg-sky-100 px-2 py-0.5 text-xs text-sky-700 dark:bg-sky-500/10 dark:text-sky-400"
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
