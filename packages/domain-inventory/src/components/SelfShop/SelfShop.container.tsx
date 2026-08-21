"use client";

import React, { useEffect, useState } from "react";
import { api } from "@soustools/api-client";
import { toast } from "sonner";
import { SelfShopView, type PopulatedPO } from "./SelfShop.view";

export interface SelfShopProps {
  orderId: string;
}

export function SelfShopContainer({ orderId }: SelfShopProps) {
  const [po, setPo] = useState<PopulatedPO | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPO = async () => {
      try {
        const { data, error } = await (api.GET as any)(
          `/purchase-orders/${orderId}`,
        );
        if (!error && data) {
          const payload = (data as any).data;
          if (payload) {
            setPo(payload);
            if (typeof window !== "undefined") {
              const cached = localStorage.getItem(`shop-checked-${orderId}`);
              if (cached) setCheckedItems(new Set(JSON.parse(cached)));
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch PO", err);
      }
      setLoading(false);
    };
    fetchPO();
  }, [orderId]);

  const toggleCheck = (itemId: string) => {
    const next = new Set(checkedItems);
    if (next.has(itemId)) next.delete(itemId);
    else next.add(itemId);

    setCheckedItems(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `shop-checked-${orderId}`,
        JSON.stringify(Array.from(next)),
      );
    }
  };

  const handleUploadInvoice = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !po) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("po_id", po.id);

    try {
      const res = await fetch("/api/ingestion", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast.success("Invoice ingested successfully! It is now processing.");
      } else {
        toast.error("Failed to ingest invoice.");
      }
    } catch (err) {
      console.error("Upload error", err);
      toast.error("Upload failed");
    }
  };

  return (
    <SelfShopView
      po={po}
      loading={loading}
      checkedItems={checkedItems}
      onToggleCheck={toggleCheck}
      onUploadInvoice={handleUploadInvoice}
    />
  );
}

export { SelfShopContainer as SelfShop };
