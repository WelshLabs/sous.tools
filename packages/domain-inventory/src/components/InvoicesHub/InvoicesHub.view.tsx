"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Camera,
  FileText,
  HardDrive,
  PlusCircle,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { TwoToneHeader } from "@soustools/design-system";

export interface ImportDropdownProps {
  onSelect: (type: "upload" | "camera" | "drive") => void;
}

export function ImportDropdown({ onSelect }: ImportDropdownProps) {
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
        className="bg-primary text-primary-foreground hover:bg-primary/90 flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 font-bold transition-colors"
      >
        <PlusCircle className="h-5 w-5" />
        Import Invoice
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="bg-card border-border animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border shadow-lg">
          <button
            onClick={() => {
              setIsOpen(false);
              onSelect("upload");
            }}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
          >
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Upload an Image</span>
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onSelect("camera");
            }}
            className="border-border flex w-full cursor-pointer items-center gap-3 border-t px-4 py-3 text-left transition-colors hover:bg-white/5"
          >
            <Camera className="h-5 w-5 text-emerald-500" />
            <span className="font-medium">Take Photo</span>
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onSelect("drive");
            }}
            className="border-border flex w-full cursor-pointer items-center gap-3 border-t px-4 py-3 text-left transition-colors hover:bg-white/5"
          >
            <HardDrive className="h-5 w-5 text-amber-500" />
            <span className="font-medium">Google Drive</span>
          </button>
        </div>
      )}
    </div>
  );
}

export interface InvoicesHubViewProps {
  onImportSelect: (type: "upload" | "camera" | "drive") => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  processFile: (
    e: React.ChangeEvent<HTMLInputElement>,
    source: "upload" | "camera",
  ) => void;
  isSubmitting: boolean;
}

export function InvoicesHubView({
  onImportSelect,
  fileInputRef,
  cameraInputRef,
  processFile,
  isSubmitting,
}: InvoicesHubViewProps) {
  return (
    <div className="bg-background min-h-screen flex-1 p-8">
      <div className="mb-12">
        <TwoToneHeader
          breadcrumb="Inventory / Invoices"
          title="Invoices Hub"
          trailing={<ImportDropdown onSelect={onImportSelect} />}
        />
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Centralize your purchasing records. Import physical or digital
          invoices to automatically reconcile purchase orders and update the
          items ledger.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link
          href="/inventory/invoices/new"
          className="glass-panel hover:border-primary/50 group border-border flex h-48 flex-col items-center justify-center rounded-2xl border p-6 text-center transition-colors"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 transition-transform group-hover:scale-110">
            <PlusCircle className="h-6 w-6" />
          </div>
          <h3 className="mb-1 text-lg font-bold">Manual Entry</h3>
          <p className="text-muted-foreground text-sm">Create a blank record</p>
        </Link>

        <Link
          href="/home"
          className="glass-panel hover:border-primary/50 group border-border bg-card/50 flex h-48 flex-col items-center justify-center rounded-2xl border p-6 text-center transition-colors"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 transition-transform group-hover:scale-110">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="mb-1 text-lg font-bold">Processing Queue</h3>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            Review extracted data <ArrowRight className="h-3 w-3" />
          </p>
        </Link>
      </div>

      <div>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">
          Recent Invoices
        </h2>
        <div className="glass-panel border-border text-muted-foreground rounded-2xl border p-8 text-center">
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
          <div className="bg-card border-border flex items-center gap-4 rounded-2xl border p-6 text-white shadow-2xl">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            <span className="font-bold">Starting ingestion process...</span>
          </div>
        </div>
      )}
    </div>
  );
}
