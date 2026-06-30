"use client";

import React, { useState, useEffect } from "react";
import { CloudDownload, Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import { GoogleDriveBrowser } from "./google-drive-browser";

interface UploadDropdownProps {
  documentType: "RECIPE" | "INVOICE" | "ORDER";
  label?: string;
  isGoogleConnected?: boolean;
}

export const UploadDropdown: React.FC<UploadDropdownProps> = ({ 
  documentType, 
  label = "Import",
  isGoogleConnected = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter((device) => device.kind === "videoinput");
          setHasCamera(videoDevices.length > 0);
        })
        .catch(() => setHasCamera(false));
    } else {
      setHasCamera(false);
    }
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, source: "camera" | "upload") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const { supabase } = await import("../../lib/supabase");
        const session = await supabase.auth.getSession();
        const res = await fetch("/api/ingestion/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId: "d0000000-0000-0000-0000-000000000000",
            userId: session.data.session?.user?.id,
            source,
            documentType: documentType.toLowerCase(),
            imagesBase64: [base64],
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to enqueue file");
        }
        toast.success(`${source === "camera" ? "Photo" : "File"} uploaded successfully!`, {
          description: `Processing ${documentType.toLowerCase()} in processing hub.`,
          action: {
            label: "Open Review",
            onClick: () => window.location.href = `/ingestion/review/${data.data.reviewId}`
          }
        });
      } catch (err: any) {
        console.error(err);
        toast.error(`Failed to queue ${source === "camera" ? "photo" : "file"}: ${err.message}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const idPrefix = `upload-${documentType}`;

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)} 
        className="text-sm font-semibold h-9 px-3 rounded-md border border-zinc-200 dark:border-white/20 bg-transparent text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-black/10 dark:bg-white/10 flex items-center transition-colors cursor-pointer"
      >
        <CloudDownload className="w-4 h-4 mr-1.5" /> {label}
      </button>
      
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-10 right-0 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl py-1 z-40 animate-in fade-in slide-in-from-top-2">
            <button 
              disabled={!isGoogleConnected} 
              onClick={() => { if (!isGoogleConnected) return; setIsDriveOpen(true); setIsMenuOpen(false); }} 
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 transition-colors text-left ${isGoogleConnected ? "hover:bg-zinc-100 dark:hover:bg-black/5 dark:bg-white/5 hover:text-zinc-900 dark:hover:text-white cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
            >
              <CloudDownload className="w-4 h-4" /> Google Drive
            </button>
            <button 
              disabled={!hasCamera} 
              onClick={() => { if (!hasCamera) return; document.getElementById(`${idPrefix}-camera`)?.click(); setIsMenuOpen(false); }} 
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 transition-colors text-left ${hasCamera ? "hover:bg-zinc-100 dark:hover:bg-black/5 dark:bg-white/5 hover:text-zinc-900 dark:hover:text-white cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
            >
              <Camera className="w-4 h-4" /> Take Photo
            </button>
            <button 
              onClick={() => { document.getElementById(`${idPrefix}-file`)?.click(); setIsMenuOpen(false); }} 
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-black/5 dark:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-colors text-left cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Upload File
            </button>
          </div>
        </>
      )}
      
      <input type="file" accept="image/*,application/pdf" id={`${idPrefix}-camera`} className="hidden" onChange={(e) => handleUpload(e, "camera")} />
      <input type="file" accept="image/*,application/pdf" id={`${idPrefix}-file`} className="hidden" onChange={(e) => handleUpload(e, "upload")} />
      
      <GoogleDriveBrowser isOpen={isDriveOpen} onClose={() => setIsDriveOpen(false)} documentType={documentType} />
    </div>
  );
};
