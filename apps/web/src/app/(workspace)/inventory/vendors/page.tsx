import { config } from "@soustools/config";
import { VendorsClient } from "./vendors-client";

export const dynamic = 'force-dynamic';

export default async function VendorsPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
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
