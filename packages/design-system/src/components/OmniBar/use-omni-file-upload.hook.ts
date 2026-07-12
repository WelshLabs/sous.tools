import type React from "react";
import { useOmnibarContext, type StagedFile } from "./OmniBarContext";
import { type OmniMessage } from "@soustools/api-types";

export function useOmniFileUpload() {
  const { setStagedFiles, executeBackgroundCommand, chatHistory, setChatHistory, contextPayload } = useOmnibarContext();

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
        credentials: "include",
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

  const handleParseRecipe = async (file: StagedFile) => {
    setStagedFiles((prev) => prev.filter(f => f.id !== file.id));

    const userMsg: OmniMessage = {
      id: file.id,
      role: 'user',
      content: `Parse Recipe: ${file.url || file.file?.name || "Image"}`,
      timestamp: new Date()
    };

    const loadingMessageId = crypto.randomUUID();
    const pendingMsg: OmniMessage = {
      id: loadingMessageId,
      role: 'agent_step',
      content: "Yes Chef, parsing recipe...",
      isLoading: true,
      timestamp: new Date()
    };

    setChatHistory([...chatHistory, userMsg, pendingMsg]);

    try {
      let base64: string | undefined;
      if (file.file) {
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.file!);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
        });
      }

      const orgId = contextPayload.organizationId || "d0000000-0000-0000-0000-000000000000";

      const res = await fetch("/api/ingestion/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          imageBase64: base64,
        }),
      });

      if (!res.ok) throw new Error("Failed to parse recipe");

      const payload = await res.json();
      const recipeData = payload.data || payload;

      const recipeMsg: OmniMessage = {
        id: loadingMessageId,
        role: 'model',
        content: "Heard, Chef! I've extracted the recipe details. Please verify the ingredient mappings below:",
        recipeData,
        timestamp: new Date()
      };

      setChatHistory([...chatHistory, userMsg, recipeMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: OmniMessage = {
        id: loadingMessageId,
        role: 'model',
        content: "Sorry Chef, I encountered an error while parsing the recipe.",
        timestamp: new Date()
      };
      setChatHistory([...chatHistory, userMsg, errorMsg]);
    }
  };

  const handleActionChip = (action: "Extract Invoice" | "Parse Recipe", file: StagedFile) => {
    if (action === "Parse Recipe") {
      handleParseRecipe(file);
      return;
    }

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

  return { onFileSelect, handleDrop, handleActionChip, handleFileUpload };
}
