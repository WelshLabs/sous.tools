import { clientConfig as config } from "@soustools/config/client";
import { ItemsLedgerContainer } from "@soustools/domain-inventory";

export const dynamic = "force-dynamic";

export default async function ItemsLedgerPage() {
  const baseUrl = config.NEXT_PUBLIC_API_URL;
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

  return <ItemsLedgerContainer initialItems={items} />;
}
