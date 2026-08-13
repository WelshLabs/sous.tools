import { clientConfig as config } from "@soustools/config/client";
import { OrdersClient } from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const baseUrl = config.NEXT_PUBLIC_API_URL;
  let vendors = [];
  let whiteboardItems = [];
  let purchaseOrders = [];

  try {
    const [vendorsRes, whiteboardRes, poRes] = await Promise.all([
      fetch(`${baseUrl}/vendors`, { cache: "no-store" }),
      fetch(`${baseUrl}/whiteboard`, { cache: "no-store" }),
      fetch(`${baseUrl}/purchase-orders`, { cache: "no-store" }),
    ]);

    if (vendorsRes.ok) {
      const vData = await vendorsRes.json();
      vendors = vData.data || [];
    }

    if (whiteboardRes.ok) {
      const wData = await whiteboardRes.json();
      whiteboardItems = wData.data || [];
    }

    if (poRes.ok) {
      const pData = await poRes.json();
      purchaseOrders = pData.data || [];
    }
  } catch (err) {
    console.error("Failed to load orders data:", err);
  }

  return (
    <OrdersClient
      initialVendors={vendors}
      initialWhiteboardItems={whiteboardItems}
      initialPurchaseOrders={purchaseOrders}
    />
  );
}
