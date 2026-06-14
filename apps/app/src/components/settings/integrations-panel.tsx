"use client";

import React, { useEffect, useState } from "react";
import { IntegrationStatus } from "@soustools/api-types";
import { IntegrationCard } from "./integration-card";
import { Loader2 } from "lucide-react";

export const IntegrationsPanel: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/integrations/status");
      if (res.ok) {
        const payload = await res.json();
        if (payload.success) {
          setIntegrations(payload.data || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const status = params.get("status");
      const tab = params.get("tab");
      if (tab === "integrations" && status) {
        if (status === "success") {
          setNotification({ type: "success", message: "Account connected successfully!" });
        } else {
          const msg = params.get("message") || "Failed to connect integration.";
          setNotification({ type: "error", message: msg });
        }
        const newUrl = window.location.pathname + (tab ? `?tab=${tab}` : "");
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  const handleConnect = (provider: string) => {
    window.location.href = `/api/integrations/connect/${provider.toLowerCase()}`;
  };

  const handleDisconnect = async (provider: string) => {
    setActionLoading(true);
    setNotification(null);
    try {
      const res = await fetch(`/api/integrations/disconnect/${provider.toLowerCase()}`, { method: "DELETE" });
      const payload = await res.json();
      if (payload.success) {
        setNotification({ type: "success", message: `${provider} integration disconnected.` });
        fetchStatus();
      } else {
        setNotification({ type: "error", message: payload.error || "Failed to disconnect." });
      }
    } catch {
      setNotification({ type: "error", message: "Network error during disconnection." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSquareAction = async (action: "sync" | "seed") => {
    setActionLoading(true);
    setNotification(null);
    try {
      const res = await fetch(`/api/integrations/square/${action}`, { method: "POST" });
      const payload = await res.json();
      if (payload.success) {
        setNotification({
          type: "success",
          message: action === "sync"
            ? "Square menu catalog synchronized successfully!"
            : "Square sandbox catalog seeded successfully!",
        });
      } else {
        setNotification({ type: "error", message: payload.error || `Failed to ${action} catalog.` });
      }
    } catch {
      setNotification({ type: "error", message: "Network error during square operation." });
    } finally {
      setActionLoading(false);
    }
  };

  const isDev = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`p-4 rounded-xl border text-sm transition-all duration-300 animate-fadeIn ${
            notification.type === "success"
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
              : "bg-red-950/20 border-red-500/30 text-red-400"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["SQUARE", "GOOGLE"].map((provider) => {
          const status = integrations.find((i) => i.provider === provider) || {
            provider: provider as "SQUARE" | "GOOGLE",
            connected: false,
          };
          return (
            <IntegrationCard
              key={provider}
              status={status}
              onConnect={() => handleConnect(provider)}
              onDisconnect={() => handleDisconnect(provider)}
              onSync={provider === "SQUARE" ? () => handleSquareAction("sync") : undefined}
              onSeed={provider === "SQUARE" ? () => handleSquareAction("seed") : undefined}
              isDev={isDev}
              isActionLoading={actionLoading}
            />
          );
        })}
      </div>
    </div>
  );
};
