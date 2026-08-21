"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { InvoicesHubView } from "./InvoicesHub.view";

export function InvoicesHubContainer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImportSelect = (type: "upload" | "camera" | "drive") => {
    if (type === "upload") {
      fileInputRef.current?.click();
    } else if (type === "camera") {
      cameraInputRef.current?.click();
    }
  };

  const submitIngestionPayload = async (payload: any) => {
    try {
      const res = await fetch("/api/ingestion/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const payloadData = await res.json();
        const reviewId = payloadData.reviewId || payloadData.data?.reviewId;
        if (typeof window !== "undefined") {
          window.location.href = `/home${reviewId ? `?reviewId=${reviewId}` : ""}`;
        }
      } else {
        toast.error("Failed to ingest invoice.");
      }
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const processFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    source: "upload" | "camera",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      await submitIngestionPayload({
        source,
        sourceName: file.name,
        pagesInput: [{ pageNumber: 1, rawText: base64String }],
      });
    };
    reader.onerror = () => {
      setIsSubmitting(false);
      toast.error("Failed to read file.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <InvoicesHubView
      onImportSelect={handleImportSelect}
      fileInputRef={fileInputRef}
      cameraInputRef={cameraInputRef}
      processFile={processFile}
      isSubmitting={isSubmitting}
    />
  );
}

export { InvoicesHubContainer as InvoicesHub };
