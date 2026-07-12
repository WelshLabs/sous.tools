"use client";

import React from "react";
import { type IntegrationStatus } from "@soustools/api-types";
import { Button } from "@soustools/design-system";
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Loader2,
} from "lucide-react";

interface IntegrationCardProps {
  status: IntegrationStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync?: () => void;
  onSeed?: () => void;
  isDev?: boolean;
  isActionLoading?: boolean;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  status,
  onConnect,
  onDisconnect,
  onSync,
  onSeed,
  isDev = false,
  isActionLoading = false,
}) => {
  const isSquare = status.provider === "SQUARE";
  const displayName = isSquare ? "Square POS" : "Google Workspace";
  const desc = isSquare
    ? "Sync menu catalog, inventory status, and pricing directly from your Square merchant account."
    : "Connect with Google Drive to auto-ingest culinary invoices, vendor lists, and recipes.";

  return (
    <div
      className={`p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[280px] ${
        status.connected
          ? "bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 dark:border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]"
          : "bg-card border-border dark:bg-zinc-950/40 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xl"
      }`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {displayName}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">{desc}</p>
          </div>
          {status.connected ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50">
              <CheckCircle className="w-3.5 h-3.5" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-card px-2.5 py-1 rounded-full border border-border">
              <AlertCircle className="w-3.5 h-3.5" /> Disconnected
            </span>
          )}
        </div>

        {/* Connected account details */}
        {status.connected && (
          <div className="bg-card/50 dark:bg-card/40 border border-border rounded-xl p-3 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 block">
              Connected Account:
            </span>
            <span className="text-zinc-800 dark:text-zinc-200 font-medium font-mono truncate block">
              {status.connectedAs || "Active Session"}
            </span>
          </div>
        )}
      </div>

      {/* Action panel */}
      <div className="pt-4 flex flex-wrap gap-2 items-center justify-end">
        {status.connected ? (
          <>
            {isSquare && onSync && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                disabled={isActionLoading}
                className="flex items-center gap-1.5"
              >
                {isActionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Sync Catalog
              </Button>
            )}
            {isSquare && isDev && onSeed && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSeed}
                disabled={isActionLoading}
                className="flex items-center gap-1.5 border-amber-500/30 hover:bg-amber-500/10 text-amber-400 animate-pulse"
              >
                <Database className="w-3.5 h-3.5" />
                Seed Sandbox
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={onDisconnect}
              disabled={isActionLoading}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={onConnect}
            disabled={isActionLoading}
          >
            Connect To {displayName}
          </Button>
        )}
      </div>
    </div>
  );
};
