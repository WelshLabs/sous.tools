"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@soustools/api-client";
import { AddVendorView, type AddVendorFormData } from "./AddVendor.view";

export interface AddVendorProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function AddVendorContainer({ onSuccess, onCancel }: AddVendorProps) {
  const [form, setForm] = useState<AddVendorFormData>({
    name: "",
    order_method: "MANUAL",
    email: "",
    phone: "",
    order_days: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Vendor name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await (api.POST as any)("/vendors", {
        body: form,
      });

      if (error || !data || (data as any).success === false) {
        throw new Error(
          (error as any)?.message ||
            (data as any)?.error ||
            "Failed to save vendor",
        );
      }

      toast.success("Vendor created successfully!");
      if (onSuccess) {
        onSuccess();
      } else if (typeof window !== "undefined") {
        window.location.href = "/inventory/vendors";
      }
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <AddVendorView
      form={form}
      setForm={setForm}
      isSubmitting={isSubmitting}
      onSave={handleSave}
      onCancel={handleCancel}
      daysOfWeek={DAYS_OF_WEEK}
    />
  );
}

export { AddVendorContainer as AddVendor };
