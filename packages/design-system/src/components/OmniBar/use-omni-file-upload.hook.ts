import type React from "react";
import { useRef, useEffect } from "react";
import { useOmnibarContext, type StagedFile } from "./OmniBarContext";

export function useOmniFileUpload() {
  const { setStagedFiles } = useOmnibarContext();
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

  // Revoke all object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      revokeAllTrackedURLs();
    };
  }, []);

  /**
   * Stages a single file. Generates a local previewUrl for images.
   * Does NOT auto-submit — the user types their intent and hits Enter.
   */
  const handleFileUpload = (file: File) => {
    const fileId = crypto.randomUUID();
    const isImage = file.type.startsWith("image/");
    let previewUrl: string | undefined;

    if (isImage) {
      previewUrl = URL.createObjectURL(file);
      trackObjectURL(previewUrl);
    }

    const newStagedFile: StagedFile = {
      id: fileId,
      url: null,
      status: "complete",
      file,
      previewUrl,
    };

    setStagedFiles((prev) => [...prev, newStagedFile]);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(handleFileUpload);
      // Reset input value so the same file can be re-selected
      e.target.value = "";
    }
  };

  /**
   * Supports multi-file drops — each file is staged independently.
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(handleFileUpload);
    }
  };

  return { onFileSelect, handleDrop, handleFileUpload };
}
