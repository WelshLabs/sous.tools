import { SettingsClient } from "./settings-client";
import { api } from "@soustools/api-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let integrations = [];
  try {
    const { data, error } = await (api.GET as any)("/integrations/status", {
      cache: "no-store",
    });
    if (!error && data) {
      integrations = (data as any).data || [];
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
