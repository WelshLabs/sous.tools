import { useState, useEffect } from "react";

export function useVisualBuilderData(organizationId: string | undefined) {
  const [items, setItems] = useState<{ id: string; name: string; each_weight_g: number | null }[]>([]);
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/items");
        if (res.ok) {
          const payload = await res.json();
          const data = payload.data;
          if (data) {
            setItems(data.map((d: any) => ({ id: d.id, name: d.name, each_weight_g: d.each_weight_g })));
          }
        }
      } catch (err) {
        console.error("Failed to load items", err);
      }
    };
    const fetchVendors = async () => {
      try {
        const res = await fetch("/api/vendors");
        if (res.ok) {
          const payload = await res.json();
          const data = payload.data;
          if (data) {
            setVendors(data.map((d: any) => ({ id: d.id, name: d.name })));
          }
        }
      } catch (err) {
        console.error("Failed to load vendors", err);
      }
    };
    if (organizationId) {
      fetchItems();
      fetchVendors();
    }
  }, [organizationId]);

  return { items, setItems, vendors, setVendors };
}
