"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TwoToneHeader } from "@soustools/design-system";

export const dynamic = "force-dynamic";

export default function InterceptedAddVendorModal() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    name: "",
    order_method: "MANUAL",
    email: "",
    phone: "",
    order_days: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Close modal on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      router.back();
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Vendor name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save vendor");

      toast.success("Vendor created successfully!");

      // Navigate back to close modal
      router.back();
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[var(--z-overlay)] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl bg-background rounded-2xl shadow-2xl border border-border flex flex-col max-h-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 overflow-y-auto">
          <TwoToneHeader
            title="Add Vendor"
            breadcrumb="Inventory / Vendors / Add"
          />

          <div className="mt-6 flex flex-col gap-6">
            <div>
              <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 block mb-2">
                Vendor Name
              </label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Sysco, Local Farm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-border rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 block mb-2">
                Order Method
              </label>
              <select
                value={form.order_method}
                onChange={(e) =>
                  setForm({ ...form, order_method: e.target.value })
                }
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-border rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="EMAIL">Email</option>
                <option value="SMS">Text Message</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>

            {form.order_method === "EMAIL" && (
              <div>
                <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="vendor@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-border rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}

            {form.order_method === "SMS" && (
              <div>
                <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 block mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 555-555-5555"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-border rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}

            <div>
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 block mb-2">
                Select Order Days
              </span>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = form.order_days.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setForm({
                          ...form,
                          order_days: isSelected
                            ? form.order_days.filter((d) => d !== day)
                            : [...form.order_days, day],
                        });
                      }}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors border cursor-pointer ${
                        isSelected
                          ? "bg-sky-500 border-sky-500 text-foreground font-semibold"
                          : "bg-white dark:bg-card border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-400 hover:border-sky-500"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-muted/30 flex gap-4 mt-auto">
          <button
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-zinc-900 dark:text-foreground rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-foreground rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}
