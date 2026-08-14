"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  FileText,
  HardDrive,
  PlusCircle,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { TwoToneHeader } from "@soustools/design-system";
// import { GoogleDriveBrowser } from "@soustools/domain-settings";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

function ImportDropdown({
  onSelect,
}: {
  onSelect: (type: "upload" | "camera" | "drive") => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors cursor-pointer"
      >
        <PlusCircle className="w-5 h-5" />
        Import Invoice
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => {
              setIsOpen(false);
              onSelect("upload");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left cursor-pointer"
          >
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Upload an Image</span>
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onSelect("camera");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-t border-border cursor-pointer"
          >
            <Camera className="w-5 h-5 text-emerald-500" />
            <span className="font-medium">Take Photo</span>
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onSelect("drive");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-t border-border cursor-pointer"
          >
            <HardDrive className="w-5 h-5 text-amber-500" />
            <span className="font-medium">Google Drive</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function InvoicesHubPage() {
  // const [showDriveBrowser, setShowDriveBrowser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImportSelect = (type: "upload" | "camera" | "drive") => {
    if (type === "drive") {
      // setShowDriveBrowser(true);
    } else if (type === "upload") {
      fileInputRef.current?.click();
    } else if (type === "camera") {
      cameraInputRef.current?.click();
    }
  };

  const submitIngestionPayload = async (payload: any) => {
    try {
      const res = await fetch("/api/unified-ingestion/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const payloadData = await res.json();
        const reviewId = payloadData.reviewId || payloadData.data?.reviewId;
        router.push(`/home${reviewId ? `?reviewId=${reviewId}` : ""}`);
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
    // Reset input
    e.target.value = "";
  };

  /*
  const handleDriveImport = async (fileIds: string[], documentType: string) => {
    setIsSubmitting(true);
    await submitIngestionPayload({
      organizationId: "d0000000-0000-0000-0000-000000000000",
      userId: "d0000000-0000-0000-0000-000000000000",
      source: "google_drive",
      documentType: documentType.toLowerCase(),
      fileIds
    });
  };
  */

  /*
  const handleDriveSearch = async (query: string, folderId?: string) => {
    try {
      const res = await fetch(`/api/integrations/google-drive/search?q=${encodeURIComponent(query)}&folderId=${folderId || ""}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };
  */

  return (
    <div className="flex-1 bg-background p-8 min-h-screen">
      <div className="mb-12">
        <TwoToneHeader
          breadcrumb="Inventory / Invoices"
          title="Invoices Hub"
          trailing={<ImportDropdown onSelect={handleImportSelect} />}
        />
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Centralize your purchasing records. Import physical or digital
          invoices to automatically reconcile purchase orders and update the
          items ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Manual Entry */}
        <Link
          href="/inventory/invoices/new"
          className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors group h-48 border border-border"
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">Manual Entry</h3>
          <p className="text-sm text-muted-foreground">Create a blank record</p>
        </Link>

        {/* Processing Queue Link */}
        <Link
          href="/home"
          className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors group h-48 border border-border bg-card/50"
        >
          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">Processing Queue</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Review extracted data <ArrowRight className="w-3 h-3" />
          </p>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Recent Invoices
        </h2>
        <div className="glass-panel p-8 rounded-2xl border border-border text-center text-muted-foreground">
          <p>
            The historical invoice view will be implemented in the next sprint.
          </p>
        </div>
      </div>

      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => processFile(e, "upload")}
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={cameraInputRef}
        onChange={(e) => processFile(e, "camera")}
      />

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-2xl flex items-center gap-4 text-white">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-bold">Starting ingestion process...</span>
          </div>
        </div>
      )}

      {/* <GoogleDriveBrowser
        isOpen={showDriveBrowser}
        onClose={() => setShowDriveBrowser(false)}
        documentType="INVOICE"
        onSearch={handleDriveSearch}
        onImport={handleDriveImport}
      /> */}
    </div>
  );
}
