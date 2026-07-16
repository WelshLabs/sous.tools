"use client";

import React, { useState, useEffect } from "react";
import { type PosItem } from "@soustools/api-types";
import { api } from "@soustools/api-client";
import { MOCK_POS_ITEMS, mapDbItemToPosItem, type RawDbPosItem } from "./helpers";
import { PosSimulator } from "./PosSimulator";

export const PosSimulatorContainer: React.FC = () => {
  const [items, setItems] = useState<PosItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [promptItem, setPromptItem] = useState<PosItem | null>(null);

  const fetchItems = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data: payload, error } = (await api.GET("/pos-simulator/items", {
        params: {
          query: {
            organizationId: "d0000000-0000-0000-0000-000000000000",
          },
        },
      })) as any;

      if (!error && payload?.success && payload.data) {
        const mapped = (payload.data as RawDbPosItem[]).map(mapDbItemToPosItem);
        setItems(mapped);
        return;
      }
      setItems(MOCK_POS_ITEMS);
    } catch {
      setItems(MOCK_POS_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const updateItemStatus = async (
    itemId: string,
    isSoldOut: boolean,
    quantity?: number,
    unlimited?: boolean
  ): Promise<void> => {
    setUpdatingId(itemId);
    try {
      const { data: payload, error } = (await api.POST("/pos-simulator/items/toggle-sold-out", {
        body: { itemId, isSoldOut, quantity, unlimited },
      } as any)) as any;

      if (!error && payload?.success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, isSoldOut } : item
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleSoldOut = async (
    itemId: string,
    isSoldOut: boolean
  ): Promise<void> => {
    if (isSoldOut) {
      const item = items.find((i) => i.id === itemId);
      if (item) setPromptItem(item);
    } else {
      await updateItemStatus(itemId, true);
    }
  };

  const handleConfirmStock = async (
    quantity: number | undefined,
    unlimited: boolean
  ): Promise<void> => {
    if (!promptItem) return;
    const itemId = promptItem.id;
    setPromptItem(null);
    await updateItemStatus(itemId, false, quantity, unlimited);
  };

  return (
    <PosSimulator
      items={items}
      loading={loading}
      updatingId={updatingId}
      promptItem={promptItem}
      setPromptItem={setPromptItem}
      onRefresh={fetchItems}
      onToggleSoldOut={handleToggleSoldOut}
      onConfirmStock={handleConfirmStock}
    />
  );
};

export default PosSimulatorContainer;

