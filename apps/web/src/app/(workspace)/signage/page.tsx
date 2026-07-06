import { config } from "@soustools/config";
import { TwoToneHeader } from "@soustools/design-system";
import { DecksListClient } from "./decks-list-client";

export default async function TVSignageListPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  let decks = [];

  try {
    const res = await fetch(`${baseUrl}/signage/layouts`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      decks = data.data || [];
    }
  } catch (err) {
    console.error("Failed to load decks:", err);
  }

  return (
    <div className="flex flex-col h-full">
      <TwoToneHeader title="Digital Signage" />
      <DecksListClient initialDecks={decks} />
    </div>
  );
}
