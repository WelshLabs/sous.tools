import type React from "react";
import { useOmnibarContext, type StagedFile } from "./OmniBarContext";
import { type OmniMessage } from "@soustools/api-types";
import { api, uploadFile } from "@soustools/api-client";

export function useOmniFileUpload() {
  const { setStagedFiles, chatHistory, setChatHistory, contextPayload } = useOmnibarContext();

  const handleFileUpload = async (file: File) => {
    const fileId = crypto.randomUUID();
    const newStagedFile: StagedFile = { id: fileId, url: null, status: 'complete', file };
    setStagedFiles((prev) => [...prev, newStagedFile]);
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

    const imageUrl = file.file ? URL.createObjectURL(file.file) : file.url;
    const userMsg: OmniMessage = {
      id: file.id,
      role: 'user',
      content: `Parse Recipe: ${imageUrl || "Image"}`,
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
      let publicUrl: string | undefined;
      if (file.file) {
        publicUrl = await uploadFile(file.file);
      }

      const orgId = (contextPayload.organizationId as string) || "d0000000-0000-0000-0000-000000000000";

      const { data, error } = await api.POST("/ingestion/recipe", {
        body: {
          organizationId: orgId,
          sourceUrl: publicUrl,
          sourceName: file.file?.name,
        },
      });

      if (error) throw new Error("Failed to parse recipe");

      const recipeData = (data.data || data) as { ingredients?: unknown[]; recipeName?: string; extractedMetadata?: Record<string, unknown> };
      if (recipeData) {
        if (!recipeData.extractedMetadata) recipeData.extractedMetadata = {};
        recipeData.extractedMetadata.sourceUrl = imageUrl;
      }

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
      // Reset staged file gracefully
      setStagedFiles((prev) => [...prev, file]);
      const errorMsg: OmniMessage = {
        id: loadingMessageId,
        role: 'model',
        content: "Sorry Chef, I encountered an error while parsing the recipe.",
        timestamp: new Date()
      };
      setChatHistory([...chatHistory, userMsg, errorMsg]);
    }
  };

  const handleExtractInvoice = async (file: StagedFile) => {
    setStagedFiles((prev) => prev.filter(f => f.id !== file.id));

    const imageUrl = file.file ? URL.createObjectURL(file.file) : file.url;
    const userMsg: OmniMessage = {
      id: file.id,
      role: 'user',
      content: `Extract Invoice: ${imageUrl || "Image"}`,
      timestamp: new Date()
    };

    const loadingMessageId = crypto.randomUUID();
    const pendingMsg: OmniMessage = {
      id: loadingMessageId,
      role: 'agent_step',
      content: "Extracting invoice...",
      isLoading: true,
      timestamp: new Date()
    };

    setChatHistory([...chatHistory, userMsg, pendingMsg]);

    try {
      let publicUrl: string | undefined;
      if (file.file) {
        publicUrl = await uploadFile(file.file);
      }

      const orgId = (contextPayload.organizationId as string) || "d0000000-0000-0000-0000-000000000000";

      const { data, error } = await api.POST("/ingestion/invoice", {
        body: {
          organizationId: orgId,
          sourceUrl: publicUrl,
          sourceName: file.file?.name,
        },
      });

      if (error) throw new Error("Failed to extract invoice");

      const extractedData = (data.data || data) as { items?: unknown[]; vendorName?: string; extractedMetadata?: Record<string, unknown> };
      if (extractedData) {
        if (!extractedData.extractedMetadata) extractedData.extractedMetadata = {};
        extractedData.extractedMetadata.sourceUrl = imageUrl;
      }

      const successMsg: OmniMessage = {
        id: loadingMessageId,
        role: 'model',
        content: `Invoice extracted successfully! Found ${extractedData?.items?.length || 0} items from ${extractedData?.vendorName || "Vendor"}. Please verify the ingredient mappings below:`,
        invoiceData: extractedData,
        timestamp: new Date()
      };

      setChatHistory([...chatHistory, userMsg, successMsg]);
    } catch (err) {
      console.error(err);
      // Reset staged file gracefully
      setStagedFiles((prev) => [...prev, file]);
      const errorMsg: OmniMessage = {
        id: loadingMessageId,
        role: 'model',
        content: "Sorry, I encountered an error while extracting the invoice.",
        timestamp: new Date()
      };
      setChatHistory([...chatHistory, userMsg, errorMsg]);
    }
  };

  const handleActionChip = (action: "Extract Invoice" | "Parse Recipe", file: StagedFile) => {
    if (action === "Parse Recipe") {
      handleParseRecipe(file);
      return;
    } else if (action === "Extract Invoice") {
      handleExtractInvoice(file);
      return;
    }
  };

  return { onFileSelect, handleDrop, handleActionChip, handleFileUpload };
}
