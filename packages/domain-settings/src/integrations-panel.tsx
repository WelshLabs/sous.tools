"use client";

import React, { useState, useEffect } from "react";
import { IntegrationStatus } from "@soustools/api-types";
import { IntegrationCard } from "./integration-card";


export interface IntegrationsPanelProps {
  integrations: IntegrationStatus[];
  onConnect: (provider: string) => void;
  onDisconnect: (provider: string) => Promise<void>;
  onSquareAction: (action: "sync" | "seed") => Promise<void>;
  isDev: boolean;
}

export function IntegrationsPanel({
  integrations,
  onConnect,
  onDisconnect,
  onSquareAction,
  isDev,
}: IntegrationsPanelProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const status = params.get("status");
      const tab = params.get("tab");
      if (tab === "integrations" && status) {
        if (status === "success") {
          setNotification({
            type: "success",
            message: "Account connected successfully!",
          });
        } else {
          const msg = params.get("message") || "Failed to connect integration.";
          setNotification({ type: "error", message: msg });
        }
        const newUrl = window.location.pathname + (tab ? `?tab=${tab}` : "");
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  const handleDisconnect = async (provider: string) => {
    setActionLoading(true);
    setNotification(null);
    try {
      await onDisconnect(provider);
      setNotification({
        type: "success",
        message: `${provider} integration disconnected.`,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Network error during disconnection.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSquareAction = async (action: "sync" | "seed") => {
    setActionLoading(true);
    setNotification(null);
    try {
      await onSquareAction(action);
      setNotification({
        type: "success",
        message:
          action === "sync"
            ? "Square menu catalog synchronized successfully!"
            : "Square sandbox catalog seeded successfully!",
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || `Failed to ${action} catalog.`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`p-4 rounded-xl border text-sm transition-all duration-300 animate-in fade-in ${
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
              onConnect={() => onConnect(provider)}
              onDisconnect={() => handleDisconnect(provider)}
              onSync={
                provider === "SQUARE"
                  ? () => handleSquareAction("sync")
                  : undefined
              }
              onSeed={
                provider === "SQUARE"
                  ? () => handleSquareAction("seed")
                  : undefined
              }
              isDev={isDev}
              isActionLoading={actionLoading}
            />
          );
        })}
      </div>
    </div>
  );
}
