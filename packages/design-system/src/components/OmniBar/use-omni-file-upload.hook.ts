import type React from "react";
import { useOmnibarContext, type StagedFile } from "./OmniBarContext";
import { type OmniMessage } from "@soustools/api-types";

export function useOmniFileUpload() {
  const { setStagedFiles, executeBackgroundCommand, chatHistory, setChatHistory } = useOmnibarContext();

  const handleFileUpload = async (file: File) => {
    const fileId = crypto.randomUUID();
    const newStagedFile: StagedFile = { id: fileId, url: null, status: 'uploading', file };
    setStagedFiles((prev) => [...prev, newStagedFile]);

    try {
      // 1. Get a secure signed upload URL from NestJS API (which communicates with Supabase)
      const res = await fetch("/api/storage/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: file.name }),
      });

      if (!res.ok) {
        throw new Error("Failed to retrieve signed upload URL from API");
      }

      const payload = await res.json();
      if (!payload.success || !payload.data?.signedUrl || !payload.data?.publicUrl) {
        throw new Error(payload.error || "Invalid response structure from API");
      }

      const { signedUrl, publicUrl } = payload.data;

      // 2. Upload the binary data directly to the signed URL (bypass NestJS to save server bandwidth)
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`Direct upload failed with status ${uploadRes.status}`);
      }

      setStagedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, url: publicUrl, status: 'complete' } : f))
      );

      // Trigger background analysis
      executeBackgroundCommand(`[SYSTEM: User uploaded a file at ${publicUrl}. Quickly analyze the image. If it is an invoice/receipt, ask if they want to ingest it. If it's a recipe, ask if they want to save it. Adjust your response based on the image content. Use your gritty line-cook persona.]`);

    } catch (error) {
      console.error("Upload failed:", error);
      setStagedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'error' } : f))
      );
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleActionChip = (action: string, file: StagedFile) => {
    setStagedFiles((prev) => prev.filter(f => f.id !== file.id));
    
    // Convert to a user chat message with layoutId for teleportation
    const userMsg: OmniMessage = {
      id: file.id, // Keep the same ID for layout teleport
      role: 'user',
      content: `${action}: ${file.url}`,
      timestamp: new Date()
    };
    
    setChatHistory([...chatHistory, userMsg]);
    executeBackgroundCommand(`${action} ${file.url}`);
  };

  return { onFileSelect, handleDrop, handleActionChip };
}
