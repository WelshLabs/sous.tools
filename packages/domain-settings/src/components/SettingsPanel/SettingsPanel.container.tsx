/* eslint-disable max-lines */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { clientConfig } from "@soustools/config/client";
import { SettingsPanelView, type DriveFile } from "./SettingsPanel.view";
import {
  type IntegrationStatus,
  type GlobalDesignTokens,
} from "@soustools/api-types";

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

export type SettingsFormValues = z.infer<typeof SettingsSchema>;

export interface SettingsPanelProps {
  initialData?: { name: string; email: string; role: string };
  userProfile?: { name: string; email: string; role: string };
  onSaveGeneral?: (data: SettingsFormValues) => Promise<void>;

  initialTokens?: GlobalDesignTokens;
  onSaveTokens?: (tokens: GlobalDesignTokens) => Promise<void>;

  integrations?: IntegrationStatus[];
  onConnectIntegration?: (provider: string) => void;
  onDisconnectIntegration?: (provider: string) => Promise<void>;
  onSquareAction?: (action: "sync") => Promise<void>;
  isDev?: boolean;

  isDriveOpen?: boolean;
  onCloseDrive?: () => void;
  driveDocumentType?: "RECIPE" | "INVOICE" | "ORDER";
  onSearchDrive?: (query: string, folderId?: string) => Promise<DriveFile[]>;
  onImportDrive?: (fileIds: string[], documentType: string) => Promise<void>;
}

const DEFAULT_USER_DATA = {
  name: "Admin User",
  email: "admin@soustools.local",
  role: "admin",
};

export function SettingsPanel({
  initialData: propInitialData,
  userProfile,
  onSaveGeneral: customOnSaveGeneral,
  initialTokens = {},
  onSaveTokens: customOnSaveTokens,
  integrations = [],
  onConnectIntegration: customOnConnectIntegration,
  onDisconnectIntegration: customOnDisconnectIntegration,
  onSquareAction: customOnSquareAction,
  isDev = false,
  isDriveOpen = false,
  onCloseDrive = () => {},
  driveDocumentType = "RECIPE",
  onSearchDrive = async () => [],
  onImportDrive = async () => {},
}: SettingsPanelProps) {
  const initialData = propInitialData || userProfile || DEFAULT_USER_DATA;

  // --- General Settings ---
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
      name: initialData.name,
      email: initialData.email,
      password: "",
      confirmPassword: "",
    },
  });
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmitGeneral = async (data: SettingsFormValues) => {
    setGeneralSaving(true);
    setGeneralSuccess(false);
    setGeneralError(null);
    try {
      if (customOnSaveGeneral) {
        await customOnSaveGeneral(data);
      } else {
        toast.success("General settings saved!");
      }
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

  const generalProps = {
    register,
    errors,
    password,
    confirmPassword,
    initialData,
    saving: generalSaving,
    success: generalSuccess,
    serverError: generalError,
    onSubmit: handleSubmit(onSubmitGeneral),
  };

  // --- Styling Settings ---
  const [tokens, setTokens] = useState<GlobalDesignTokens>(initialTokens);
  const [tokensSaving, setTokensSaving] = useState(false);
  const [tokensSuccess, setTokensSuccess] = useState(false);

  const handleTokenChange = (key: keyof GlobalDesignTokens, value: string) => {
    setTokens((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmitTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokensSaving(true);
    setTokensSuccess(false);
    try {
      if (customOnSaveTokens) {
        await customOnSaveTokens(tokens);
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("globalDesignTokens", JSON.stringify(tokens));
          window.dispatchEvent(
            new CustomEvent("soustools:design-tokens-updated", {
              detail: tokens,
            }),
          );
        }
        try {
          const apiBase =
            clientConfig.NEXT_PUBLIC_API_URL || "http://localhost:3001";
          await fetch(`${apiBase}/organizations/design-tokens?orgId=default`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ designTokens: tokens }),
          });
        } catch (_err) {
          // Offline-safe fallback
        }
        toast.success("Global styling tokens saved!");
      }
      setTokensSuccess(true);
      setTimeout(() => setTokensSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setTokensSaving(false);
    }
  };

  const stylingProps = {
    tokens,
    saving: tokensSaving,
    success: tokensSuccess,
    onChangeToken: handleTokenChange,
    onSubmit: onSubmitTokens,
  };

  // --- Integrations State ---
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleConnect = (provider: string) => {
    if (customOnConnectIntegration) {
      customOnConnectIntegration(provider);
    } else {
      const apiBase =
        clientConfig.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      window.location.href = `${apiBase}/integrations/connect/${provider.toLowerCase()}?orgId=default`;
    }
  };

  const handleDisconnect = async (provider: string) => {
    setActionLoading(true);
    setNotification(null);
    try {
      if (customOnDisconnectIntegration) {
        await customOnDisconnectIntegration(provider);
      } else {
        const apiBase =
          clientConfig.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(
          `${apiBase}/integrations/disconnect/${provider.toLowerCase()}?orgId=default`,
          { method: "DELETE" },
        );
        if (!res.ok) throw new Error("Failed to disconnect");
      }
      setNotification({
        type: "success",
        message: `Successfully disconnected from ${provider}.`,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to disconnect integration.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSquareAction = async (action: "sync") => {
    setActionLoading(true);
    setNotification(null);
    try {
      if (customOnSquareAction) {
        await customOnSquareAction(action);
      } else {
        const apiBase =
          clientConfig.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(
          `${apiBase}/pos/square/sync-catalog?orgId=default`,
          { method: "POST" },
        );
        if (!res.ok) throw new Error("Failed to trigger Square sync");
      }
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

  const integrationsProps = {
    integrations,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onSquareAction: handleSquareAction,
    isDev,
    actionLoading,
    notification,
  };

  // --- Drive Browser ---
  const [driveQuery, setDriveQuery] = useState("");
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveSelectedIds, setDriveSelectedIds] = useState<Set<string>>(
    new Set(),
  );
  const [driveCurrentFolder, setDriveCurrentFolder] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleSearchDriveInternal = useCallback(
    async (q: string, folderId?: string) => {
      setDriveLoading(true);
      try {
        const activeFolder =
          folderId !== undefined ? folderId : driveCurrentFolder?.id;
        const data = await onSearchDrive(q, activeFolder);
        setDriveFiles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setDriveLoading(false);
      }
    },
    [onSearchDrive, driveCurrentFolder],
  );

  useEffect(() => {
    if (isDriveOpen) {
      setDriveQuery("");
      setDriveCurrentFolder(null);
      handleSearchDriveInternal("", "");
    }
  }, [isDriveOpen, handleSearchDriveInternal]);

  const driveToggleSelect = (id: string) => {
    const newSet = new Set(driveSelectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setDriveSelectedIds(newSet);
  };

  const handleImportDriveInternal = async () => {
    if (driveSelectedIds.size === 0) return;
    setDriveLoading(true);
    try {
      await onImportDrive(
        Array.from(driveSelectedIds),
        driveDocumentType.toLowerCase(),
      );
      onCloseDrive();
    } catch (err) {
      console.error(err);
    } finally {
      setDriveLoading(false);
    }
  };

  const driveBrowserProps = {
    isOpen: isDriveOpen,
    onClose: onCloseDrive,
    documentType: driveDocumentType,
    query: driveQuery,
    setQuery: setDriveQuery,
    files: driveFiles,
    loading: driveLoading,
    selectedIds: driveSelectedIds,
    toggleSelect: driveToggleSelect,
    currentFolder: driveCurrentFolder,
    setCurrentFolder: setDriveCurrentFolder,
    handleSearch: handleSearchDriveInternal,
    handleImport: handleImportDriveInternal,
  };

  return (
    <SettingsPanelView
      generalProps={generalProps}
      stylingProps={stylingProps}
      integrationsProps={integrationsProps}
      driveBrowserProps={driveBrowserProps}
    />
  );
}

export { SettingsPanel as SettingsPanelContainer };
