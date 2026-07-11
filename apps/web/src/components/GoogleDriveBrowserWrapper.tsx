"use client";

import React from "react";
import { GoogleDriveBrowser } from "@soustools/domain-settings";
import { useOmnibarContext, type StagedFile } from "@soustools/design-system";
import { toast } from "sonner";

export function GoogleDriveBrowserWrapper() {
  const { showGoogleDriveBrowser, setShowGoogleDriveBrowser, setStagedFiles, executeBackgroundCommand } = useOmnibarContext();

  const handleDriveSearch = async (query: string, folderId?: string) => {
    try {
      const res = await fetch(`/api/integrations/google/files?q=${encodeURIComponent(query)}&folderId=${folderId || ""}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const handleDriveImport = async (fileIds: string[], _documentType: string) => {
    if (fileIds.length === 0) return;
    
    // We will import the files one by one and add them to stagedFiles in OmniBar
    for (const fileId of fileIds) {
      const stageId = crypto.randomUUID();
      setStagedFiles((prev: StagedFile[]) => [...prev, { id: stageId, url: null, status: 'uploading' }]);
      
      try {
        const res = await fetch("/api/integrations/google/import-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId }),
        });
        
        if (!res.ok) throw new Error("Failed to import file");
        
        const payload = await res.json();
        if (!payload.success || !payload.data?.url) throw new Error("Failed to get file URL");
        
        const { url, name } = payload.data;
        
        setStagedFiles((prev: StagedFile[]) =>
          prev.map((f: StagedFile) => (f.id === stageId ? { ...f, url, status: 'complete' as const } : f))
        );
        
        toast.success(`Successfully imported ${name} from Google Drive!`);
        
        // Trigger background analysis
        executeBackgroundCommand(`[SYSTEM: User uploaded a file at ${url}. Quickly analyze the image. If it is an invoice/receipt, ask if they want to ingest it. If it's a recipe, ask if they want to save it. Adjust your response based on the image content. Use your gritty line-cook persona.]`);
      } catch (err) {
        console.error(err);
        setStagedFiles((prev: StagedFile[]) =>
          prev.map((f: StagedFile) => (f.id === stageId ? { ...f, status: 'error' as const } : f))
        );
        toast.error("Failed to import file from Google Drive.");
      }
    }
  };

  return (
    <GoogleDriveBrowser
      isOpen={!!showGoogleDriveBrowser}
      onClose={() => setShowGoogleDriveBrowser(false)}
      documentType="INVOICE"
      onSearch={handleDriveSearch}
      onImport={handleDriveImport}
    />
  );
}
