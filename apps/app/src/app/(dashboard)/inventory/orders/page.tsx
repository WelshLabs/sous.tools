import { config } from "@soustools/config";
import { OrdersClient } from "./OrdersClient";

export default async function OrdersPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  let vendors = [];
  let whiteboardItems = [];

  try {
    const [vendorsRes, whiteboardRes] = await Promise.all([
      fetch(`${baseUrl}/vendors`, { cache: "no-store" }),
      fetch(`${baseUrl}/whiteboard`, { cache: "no-store" }),
    ]);

    if (vendorsRes.ok) {
      const vData = await vendorsRes.json();
      vendors = vData.data || [];
    }

    if (whiteboardRes.ok) {
      const wData = await whiteboardRes.json();
      whiteboardItems = wData.data || [];
    }
  } catch (err) {
    console.error("Failed to load orders data:", err);
  }

  return <OrdersClient initialVendors={vendors} initialWhiteboardItems={whiteboardItems} />;
}
