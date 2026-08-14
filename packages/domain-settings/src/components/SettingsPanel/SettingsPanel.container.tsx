"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  initialData: { name: string; email: string; role: string };
  onSaveGeneral: (data: SettingsFormValues) => Promise<void>;

  initialTokens: GlobalDesignTokens;
  onSaveTokens: (tokens: GlobalDesignTokens) => Promise<void>;

  integrations: IntegrationStatus[];
  onConnectIntegration: (provider: string) => void;
  onDisconnectIntegration: (provider: string) => Promise<void>;
  onSquareAction: (action: "sync") => Promise<void>;
  isDev?: boolean;

  isDriveOpen?: boolean;
  onCloseDrive?: () => void;
  driveDocumentType?: "RECIPE" | "INVOICE" | "ORDER";
  onSearchDrive?: (query: string, folderId?: string) => Promise<DriveFile[]>;
  onImportDrive?: (fileIds: string[], documentType: string) => Promise<void>;
}

export function SettingsPanel({
  initialData,
  onSaveGeneral,
  initialTokens,
  onSaveTokens,
  integrations,
  onConnectIntegration,
  onDisconnectIntegration,
  onSquareAction,
  isDev = false,
  isDriveOpen = false,
  onCloseDrive = () => {},
  driveDocumentType = "RECIPE",
  onSearchDrive = async () => [],
  onImportDrive = async () => {},
}: SettingsPanelProps) {
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
      await onSaveGeneral(data);
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

  // --- Global Styling ---
  const [tokens, setTokens] = useState<GlobalDesignTokens>(initialTokens || {});
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
      await onSaveTokens(tokens);
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
    handleTokenChange,
    saving: tokensSaving,
    success: tokensSuccess,
    onSubmit: onSubmitTokens,
  };

  // --- Integrations ---
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
        if (status === "success")
          setNotification({
            type: "success",
            message: "Account connected successfully!",
          });
        else
          setNotification({
            type: "error",
            message: params.get("message") || "Failed to connect integration.",
          });
        const newUrl = window.location.pathname + (tab ? `?tab=${tab}` : "");
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  const handleDisconnect = async (provider: string) => {
    setActionLoading(true);
    setNotification(null);
    try {
      await onDisconnectIntegration(provider);
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
    setActionLoading(true);
    setNotification(null);
    try {
      await onSquareAction(action);
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
    onConnect: onConnectIntegration,
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
