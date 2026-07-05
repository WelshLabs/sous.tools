import { config } from "@soustools/config";
import { ItemsLedgerClient } from "./items-ledger-client";

export default async function ItemsLedgerPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  let items = [];

  try {
    const res = await fetch(`${baseUrl}/items`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      items = data.data || [];
    }
  } catch (err) {
    console.error("Failed to load items ledger:", err);
  }

  return <ItemsLedgerClient initialItems={items} />;
}
