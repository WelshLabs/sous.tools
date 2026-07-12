import { config } from "@soustools/config";
import { SettingsClient } from "./settings-client";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  
  let integrations = [];
  try {
    const res = await fetch(`${baseUrl}/integrations/status`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      integrations = data.data || [];
    }
  } catch (err) {
    console.error("Failed to load integrations status", err);
  }

  // Stub data for global styling tokens and user profile
  // In a real app, these would be fetched from the API as well
  const initialTokens = {};
  const userProfile = {
    name: "Admin User",
    email: "admin@soustools.local",
    role: "admin",
  };

  const isDev = process.env.NODE_ENV === "development";

  return (
    <SettingsClient
      integrations={integrations}
      isDev={isDev}
      initialTokens={initialTokens}
      userProfile={userProfile}
    />
  );
}
