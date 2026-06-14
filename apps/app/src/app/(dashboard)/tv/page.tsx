"use client";

import React, { useState, useEffect } from "react";
import { LayoutBuilder } from "../../../components/signage/layout-builder";
import { RawSignageLayoutConfig, PosItem } from "@soustools/api-types";
import { MOCK_POS_ITEMS } from "../../../components/signage/mock-data";
import { RefreshCw } from "lucide-react";

interface LayoutDbRecord {
  id: string;
  name: string;
  type: string;
  config: RawSignageLayoutConfig;
}

/**
 * TVSignagePage mounts the centralized digital layout builder component.
 */
export default function TVSignagePage() {
  const [layout, setLayout] = useState<LayoutDbRecord | null>(null);
  const [items, setItems] = useState<PosItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [layoutsRes, itemsRes] = await Promise.all([
        fetch("/api/signage/layouts").then((r) => r.json()),
        fetch("/api/pos/items").then((r) => r.json()),
      ]);
      if (layoutsRes.success && layoutsRes.data && layoutsRes.data.length > 0) {
        setLayout(layoutsRes.data[0]);
      }
      if (itemsRes.success && itemsRes.data) {
        setItems(itemsRes.data);
      } else {
        setItems(MOCK_POS_ITEMS);
      }
    } catch (err) {
      console.error("Failed to load page data:", err);
      setItems(MOCK_POS_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (newConfig: RawSignageLayoutConfig) => {
    setSaving(true);
    try {
      const url = layout ? `/api/signage/layouts/${layout.id}` : "/api/signage/layouts";
      const method = layout ? "PUT" : "POST";
      const payload = layout
        ? { name: layout.name, type: layout.type, config: newConfig }
        : { name: "Main Cafe Menu", type: "SPLIT_SCREEN", config: newConfig };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) setLayout(data.data);
    } catch (err) {
      console.error("Save failed:", err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-100">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-sm font-mono">Loading layouts and catalog...</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <LayoutBuilder
        layoutName="TV Signage"
        initialConfig={layout ? layout.config : undefined}
        items={items}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
