import type React from "react";
import { createBrowserClient } from "@soustools/supabase";
import { useOmnibarContext, type StagedFile } from "./OmniBarContext";
import { type OmniMessage } from "@soustools/api-types";

export function useOmniFileUpload() {
  const { setStagedFiles, executeBackgroundCommand, chatHistory, setChatHistory } = useOmnibarContext();
  const supabase = createBrowserClient();

  const handleFileUpload = async (file: File) => {
    const fileId = crypto.randomUUID();
    const newStagedFile: StagedFile = { id: fileId, url: null, status: 'uploading', file };
    setStagedFiles((prev) => [...prev, newStagedFile]);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("No active session");

      const ext = file.name.split('.').pop();
      const filePath = `${sessionData.session.user.id}/${fileId}.${ext}`;
      
      const { error } = await supabase.storage
        .from('ingestion-sources')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ingestion-sources')
        .getPublicUrl(filePath);

      setStagedFiles((prev) => prev.map(f => f.id === fileId ? { ...f, url: publicUrl, status: 'complete' } : f));

      // Trigger background analysis
      executeBackgroundCommand(`[SYSTEM: User uploaded a file at ${publicUrl}. Quickly analyze the image. If it is an invoice/receipt, ask if they want to ingest it. If it's a recipe, ask if they want to save it. Adjust your response based on the image content. Use your gritty line-cook persona.]`);

    } catch (error) {
      console.error("Upload failed:", error);
      setStagedFiles((prev) => prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f));
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
