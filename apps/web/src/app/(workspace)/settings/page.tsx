import { SettingsPanelContainer } from "@soustools/domain-settings";
import { api } from "@soustools/api-client";
import { serverConfig } from "@soustools/config/server";

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

  const initialTokens = {};
  const userProfile = {
    name: "Admin User",
    email: "admin@soustools.local",
    role: "admin",
  };

  const isDev = serverConfig.NODE_ENV === "development";

  return (
    <SettingsPanelContainer
      integrations={integrations}
      isDev={isDev}
      initialTokens={initialTokens}
      userProfile={userProfile}
    />
  );
}
