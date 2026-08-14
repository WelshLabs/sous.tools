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
      className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6"
      onClick={handleBackdropClick}
    >
      <div className="bg-background border-border animate-in zoom-in-95 flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl duration-200">
        <div className="overflow-y-auto p-6">
          <TwoToneHeader
            title="Add Vendor"
            breadcrumb="Inventory / Vendors / Add"
          />

          <div className="mt-6 flex flex-col gap-6">
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400 dark:text-zinc-500">
                Vendor Name
              </label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Sysco, Local Farm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="dark:border-border dark:text-foreground w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:ring-sky-500 focus:outline-none dark:bg-zinc-950"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400 dark:text-zinc-500">
                Order Method
              </label>
              <select
                value={form.order_method}
                onChange={(e) =>
                  setForm({ ...form, order_method: e.target.value })
                }
                className="dark:border-border dark:text-foreground w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:ring-sky-500 focus:outline-none dark:bg-zinc-950"
              >
                <option value="EMAIL">Email</option>
                <option value="SMS">Text Message</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>

            {form.order_method === "EMAIL" && (
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="vendor@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="dark:border-border dark:text-foreground w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:ring-sky-500 focus:outline-none dark:bg-zinc-950"
                />
              </div>
            )}

            {form.order_method === "SMS" && (
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 555-555-5555"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="dark:border-border dark:text-foreground w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:ring-sky-500 focus:outline-none dark:bg-zinc-950"
                />
              </div>
            )}

            <div>
              <span className="mb-2 block text-xs font-medium text-zinc-400 dark:text-zinc-500">
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
                      className={`cursor-pointer rounded-lg border px-4 py-2 text-sm transition-colors ${
                        isSelected
                          ? "text-foreground border-sky-500 bg-sky-500 font-semibold"
                          : "dark:bg-card dark:border-border border-zinc-200 bg-white text-zinc-600 hover:border-sky-500 dark:text-zinc-400"
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

        <div className="border-border bg-muted/30 mt-auto flex gap-4 border-t p-6">
          <button
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="dark:text-foreground flex-1 cursor-pointer rounded-xl bg-zinc-200 py-3 font-bold text-zinc-900 transition-colors hover:bg-zinc-300 disabled:opacity-50 dark:bg-white/10 dark:hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="text-foreground flex-1 cursor-pointer rounded-xl bg-sky-500 py-3 font-bold transition-colors hover:bg-sky-600 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}
