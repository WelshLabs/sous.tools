"use client";

import { useState } from "react";
import type { Vendor } from "@soustools/api-types";
import { VendorsPanelView } from "./VendorsPanel.view";

export interface VendorsPanelProps {
  vendors: Vendor[];
  onSave: (id: string, payload: Partial<Vendor>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddVendorClick?: () => void;
}

export function VendorsPanel({ vendors, onSave, onDelete, onAddVendorClick }: VendorsPanelProps) {
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
    <VendorsPanelView
      vendors={vendors}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      editForm={editForm}
      setEditForm={setEditForm}
      handleSave={handleSave}
      handleDelete={handleDelete}
      onAddVendorClick={onAddVendorClick}
    />
  );
}
