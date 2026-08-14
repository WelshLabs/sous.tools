"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IntegrationsPanel,
  GlobalStylingSettings,
  GeneralSettings,
  DownloadsPanel,
} from "@soustools/domain-settings";
import { Settings, Sliders, Cable, Paintbrush } from "lucide-react";
import type {
  IntegrationStatus,
  GlobalDesignTokens,
} from "@soustools/api-types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SettingsSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

type SettingsFormValues = z.infer<typeof SettingsSchema>;

export interface SettingsClientProps {
  integrations: IntegrationStatus[];
  isDev: boolean;
  initialTokens: GlobalDesignTokens;
  userProfile: {
    name: string;
    email: string;
    role: string;
  };
}

export function SettingsClient({
  integrations,
  isDev,
  initialTokens,
  userProfile,
}: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "general" | "integrations" | "styling" | "downloads"
  >("general");

  // --- General Settings State & Hook ---
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalSuccess, setGeneralSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: userProfile.name,
      email: userProfile.email,
      password: "",
      confirmPassword: "",
    },
  });
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  // --- Styling State ---
  const [tokens, setTokens] = useState<GlobalDesignTokens>(initialTokens || {});
  const [tokensSaving, setTokensSaving] = useState(false);
  const [tokensSuccess, setTokensSuccess] = useState(false);

  // --- Integrations State ---
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "integrations") {
        setActiveTab("integrations");
      } else if (tab === "styling") {
        setActiveTab("styling");
      } else if (tab === "downloads") {
        setActiveTab("downloads");
      }
    }
  }, []);

  const handleSaveGeneral = async (_data: SettingsFormValues) => {
    // Stub: send to API
    toast.success("General settings saved!");
  };

  const onSubmitGeneral = async (data: SettingsFormValues) => {
    setGeneralSaving(true);
    setGeneralSuccess(false);
    setGeneralError(null);
    try {
      await handleSaveGeneral(data);
      setGeneralSuccess(true);
      setTimeout(() => setGeneralSuccess(false), 3000);
    } catch (err: any) {
      setGeneralError(
        err instanceof Error ? err.message : "Failed to save settings",
      );
    } finally {
      setGeneralSaving(false);
    }
  };

  const handleSaveTokens = async (_tokens: GlobalDesignTokens) => {
    // Stub: send to API
    toast.success("Tokens saved!");
  };

  const handleTokenChange = (key: keyof GlobalDesignTokens, value: string) => {
    setTokens((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmitTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokensSaving(true);
    setTokensSuccess(false);
    try {
      await handleSaveTokens(tokens);
      setTokensSuccess(true);
      setTimeout(() => setTokensSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setTokensSaving(false);
    }
  };

  const getApiBase = () =>
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const handleConnectIntegration = (provider: string) => {
    window.location.href = `${getApiBase()}/integrations/connect/${provider.toLowerCase()}?orgId=default`;
  };

  const handleDisconnectIntegration = async (provider: string) => {
    const res = await fetch(
      `${getApiBase()}/integrations/disconnect/${provider.toLowerCase()}?orgId=default`,
      {
        method: "DELETE",
      },
    );
    if (!res.ok) throw new Error("Failed to disconnect");
    router.refresh();
  };

  const handleDisconnect = async (provider: string) => {
    setActionLoading(true);
    setNotification(null);
    try {
      await handleDisconnectIntegration(provider);
      setNotification({
        type: "success",
        message: `${provider} integration disconnected.`,
      });
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSquareAction = async (action: "sync") => {
    const res = await fetch(
      `${getApiBase()}/integrations/square/${action}?orgId=default`,
      {
        method: "POST",
      },
    );
    if (!res.ok) throw new Error("Failed to sync catalog");
  };

  const handleSquareActionWrapper = async (action: "sync") => {
    setActionLoading(true);
    setNotification(null);
    try {
      await handleSquareAction(action);
      setNotification({
        type: "success",
        message: "Square menu catalog synchronized successfully!",
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to sync catalog.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTabChange = (
    tab: "general" | "integrations" | "styling" | "downloads",
  ) => {
    setActiveTab(tab);
    router.replace(`/settings?tab=${tab}`);
  };

  return (
    <div className="animate-in fade-in mx-auto max-w-6xl space-y-6 text-zinc-900 dark:text-zinc-100">
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          <Settings className="h-6 w-6 animate-pulse text-sky-500" />
          Settings Panel
        </h1>
        <p className="text-muted-foreground text-xs">
          Configure global kitchen parameters, system integration profiles, and
          tenant design tokens.
        </p>
      </header>

      <div className="border-border dark:border-border flex gap-1 border-b">
        {(["general", "integrations", "styling", "downloads"] as const).map(
          (tab) => {
            const icons = {
              general: Sliders,
              integrations: Cable,
              styling: Paintbrush,
              downloads: () => (
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
              ),
            };
            const Icon = icons[tab];
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "border-sky-500 bg-sky-50 text-sky-500 dark:bg-sky-500/5 dark:text-sky-400"
                    : "dark:text-muted-foreground hover:bg-card dark:hover:bg-card/40 border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab === "styling" ? "Global Styling" : tab}
              </button>
            );
          },
        )}
      </div>

      <div className="bg-card dark:bg-card/40 border-border dark:border-border rounded-2xl border p-6 shadow-2xl backdrop-blur-2xl">
        {activeTab === "general" && (
          <GeneralSettings
            register={register}
            errors={errors}
            password={password}
            confirmPassword={confirmPassword}
            initialData={userProfile}
            saving={generalSaving}
            success={generalSuccess}
            serverError={generalError}
            onSubmit={handleSubmit(onSubmitGeneral)}
          />
        )}
        {activeTab === "integrations" && (
          <IntegrationsPanel
            integrations={integrations}
            isDev={isDev}
            onConnect={handleConnectIntegration}
            onDisconnect={handleDisconnect}
            onSquareAction={handleSquareActionWrapper}
            actionLoading={actionLoading}
            notification={notification}
          />
        )}
        {activeTab === "styling" && (
          <GlobalStylingSettings
            tokens={tokens}
            saving={tokensSaving}
            success={tokensSuccess}
            onSubmit={onSubmitTokens}
            handleTokenChange={handleTokenChange}
          />
        )}
        {activeTab === "downloads" && <DownloadsPanel />}
      </div>
    </div>
  );
}
