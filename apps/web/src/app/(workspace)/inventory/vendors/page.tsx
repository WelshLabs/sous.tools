import { clientConfig as config } from "@soustools/config/client";
import { VendorsClient } from "./vendors-client";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const baseUrl = config.NEXT_PUBLIC_API_URL;
  let vendors = [];

  try {
    const res = await fetch(`${baseUrl}/vendors`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      vendors = data.data || [];
    }
  } catch (err) {
    console.error("Failed to load vendors:", err);
  }

  return <VendorsClient initialVendors={vendors} />;
}
