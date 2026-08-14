import { clientConfig as config } from "@soustools/config/client";
import { TwoToneHeader } from "@soustools/design-system";
import { DecksListClient } from "./decks-list-client";

export const dynamic = "force-dynamic";

export default async function TVSignageListPage() {
  const baseUrl = config.NEXT_PUBLIC_API_URL;
  let decks = [];

  try {
    const res = await fetch(`${baseUrl}/signage/layouts`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      decks = data.data || [];
    }
  } catch (err) {
    console.error("Failed to load decks:", err);
  }

  return (
    <div className="flex h-full flex-col">
      <TwoToneHeader title="Digital Signage" />
      <DecksListClient initialDecks={decks} />
    </div>
  );
}
