"use client";

import React from "react";
import { toast } from "sonner";
import { VendorsPanel } from "@soustools/domain-inventory";
import type { Vendor } from "@soustools/api-types";
import { useRouter } from "next/navigation";

export interface VendorsClientProps {
  initialVendors: Vendor[];
}

export function VendorsClient({ initialVendors }: VendorsClientProps) {
  const router = useRouter();

  const handleSave = async (id: string, payload: Partial<Vendor>) => {
    try {
      const url = id === "new" ? "/api/vendors" : `/api/vendors/${id}`;
      const method = id === "new" ? "POST" : "PUT";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to save vendor");
      
      toast.success(id === "new" ? "Vendor created successfully!" : "Vendor updated successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Network error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete vendor");
      toast.success("Vendor deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  return (
    <VendorsPanel
      vendors={initialVendors}
      onSave={handleSave}
      onDelete={handleDelete}
      onAddVendorClick={() => router.push('/inventory/vendors/add')}
    />
  );
}
