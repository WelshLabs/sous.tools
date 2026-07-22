import type React from "react";
import { useRef, useEffect } from "react";
import { useOmnibarContext, type StagedFile } from "./OmniBarContext";
import { type OmniMessage } from "@soustools/api-types";
import { api, uploadFile } from "@soustools/api-client";

export function useOmniFileUpload() {
  const { setStagedFiles, chatHistory, setChatHistory, contextPayload } = useOmnibarContext();
  const objectUrlsRef = useRef<string[]>([]);

  const trackObjectURL = (url: string) => {
    objectUrlsRef.current.push(url);
  };

  const revokeAllTrackedURLs = () => {
    objectUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Failed to revoke object URL:", err);
      }
    });
    objectUrlsRef.current = [];
  };

  // Revoke URLs on unmount
  useEffect(() => {
    return () => {
      revokeAllTrackedURLs();
    };
  }, []);

  // Revoke URLs if chatHistory is cleared
  useEffect(() => {
    if (chatHistory.length === 0 && objectUrlsRef.current.length > 0) {
      revokeAllTrackedURLs();
    }
  }, [chatHistory]);

  const handleFileUpload = async (file: File) => {
    const fileId = crypto.randomUUID();
    const newStagedFile: StagedFile = { id: fileId, url: null, status: 'complete', file };
    
    // Immediately stage file
    setStagedFiles((prev) => [...prev, newStagedFile]);

    // Immediately trigger unified extraction
    await handleAutoExtract(newStagedFile);
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

  const handleAutoExtract = async (file: StagedFile) => {
    const imageUrl = file.file ? URL.createObjectURL(file.file) : file.url;
    if (file.file && imageUrl) {
      trackObjectURL(imageUrl);
    }
    const userMsg: OmniMessage = {
      id: file.id,
      role: 'user',
      content: `Extract Document: ${imageUrl || "Image"}`,
      timestamp: new Date()
    };

    const loadingMessageId = crypto.randomUUID();
    const pendingMsg: OmniMessage = {
      id: loadingMessageId,
      role: 'agent_step',
      content: "Analyzing document...",
      isLoading: true,
      timestamp: new Date()
    };

    // Show loading state right away and remove staged file from input queue
    setChatHistory([...chatHistory, userMsg, pendingMsg]);
    setStagedFiles([]);

    try {
      let publicUrl: string | undefined;
      if (file.file) {
        publicUrl = await uploadFile(file.file);
      }

      const orgId = (contextPayload.organizationId as string) || "d0000000-0000-0000-0000-000000000000";

      // Call the unified extraction endpoint (which is polymorphic)
      const { data, error } = await api.POST("/ingestion/invoice", {
        body: {
          organizationId: orgId,
          sourceUrl: publicUrl,
          sourceName: file.file?.name,
        },
      });

      if (error) throw new Error("Failed to extract document");

      const extractedData = (data.data || data) as {
        documentType?: string;
        lineItems?: unknown[];
        extractedMetadata?: Record<string, unknown>;
      };
      
      if (extractedData && extractedData.extractedMetadata) {
        extractedData.extractedMetadata.sourceUrl = imageUrl;
      }

      const isRecipe = extractedData?.documentType === "RECIPE";
      
      const successMsg: OmniMessage = {
        id: loadingMessageId,
        role: 'model',
        content: isRecipe 
          ? "Heard, Chef! I've extracted the recipe details. Please verify the ingredient mappings below:"
          : `Invoice extracted successfully! Found ${extractedData?.lineItems?.length || 0} items. Please verify the mappings below:`,
        invoiceData: !isRecipe ? extractedData : undefined,
        recipeData: isRecipe ? extractedData : undefined,
        timestamp: new Date()
      };

      setChatHistory([...chatHistory, userMsg, successMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: OmniMessage = {
        id: loadingMessageId,
        role: 'model',
        content: "Sorry Chef, I encountered an error while analyzing the document.",
        timestamp: new Date()
      };
      setChatHistory([...chatHistory, userMsg, errorMsg]);
    }
  };

  return { onFileSelect, handleDrop, handleFileUpload };
}
