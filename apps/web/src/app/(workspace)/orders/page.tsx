import { clientConfig as config } from "@soustools/config/client";
import { OrdersPanelContainer } from "@soustools/domain-inventory";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const baseUrl = config.NEXT_PUBLIC_API_URL;
  let vendors = [];
  let whiteboardItems = [];
  let purchaseOrders = [];

  try {
    const [vRes, wRes, pRes] = await Promise.all([
      fetch(`${baseUrl}/vendors`, { cache: "no-store" }),
      fetch(`${baseUrl}/whiteboard`, { cache: "no-store" }),
      fetch(`${baseUrl}/purchase-orders`, { cache: "no-store" }),
    ]);

    if (vRes.ok) {
      const vData = await vRes.json();
      vendors = vData.data || [];
    }
    if (wRes.ok) {
      const wData = await wRes.json();
      whiteboardItems = wData.data || [];
    }
    if (pRes.ok) {
      const pData = await pRes.json();
      purchaseOrders = pData.data || [];
    }
  } catch (err) {
    console.error("Failed to load purchasing page data:", err);
  }

  return (
    <OrdersPanelContainer
      initialVendors={vendors}
      initialWhiteboardItems={whiteboardItems}
      initialPurchaseOrders={purchaseOrders}
    />
  );
}
