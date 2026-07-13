import { config } from "@soustools/config";
import { TwoToneHeader } from "@soustools/design-system";
import { ItemsLedgerClient } from "./items-ledger-client";

export const dynamic = 'force-dynamic';

export default async function ItemsLedgerPage() {
  const baseUrl = config.API_BASE_URL;
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

  return (
    <div className="flex flex-col h-full">
      <TwoToneHeader title="Items Ledger" />
      <ItemsLedgerClient initialItems={items} />
    </div>
  );
}
