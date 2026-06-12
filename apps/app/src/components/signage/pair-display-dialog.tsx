"use client";

import React, { useState } from "react";
import { Button } from "@soustools/ui";
import { X } from "lucide-react";

interface PairDisplayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * PairDisplayDialog is a modal dialog that prompts the user for a 4-character pairing code
 * to connect a digital signage device to their organization.
 *
 * @tenant-docs-export
 * Use the Pair Display Dialog to securely connect a new hardware screen/device using a 4-digit pairing code.
 */
export const PairDisplayDialog: React.FC<PairDisplayDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pairingCode, setPairingCode] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePairSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (pairingCode.length !== 4) {
      setError("Pairing code must be exactly 4 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/signage/displays/pair/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pairingCode: pairingCode.toUpperCase(),
          name: displayName,
        }),
      });
      if (res.ok) {
        const payload = await res.json().catch(() => ({}));
        if (payload.success) {
          alert("Device paired successfully!");
          setPairingCode("");
          setDisplayName("");
          onSuccess();
          onClose();
        } else {
          setError(payload.error || "Failed to pair device. Check code.");
        }
      } else {
        const errPayload = await res.json().catch(() => ({}));
        setError(errPayload.error || "Failed to pair device. Check code.");
      }
    } catch {
      setError("Network error. Failed to confirm pairing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <form
        onSubmit={handlePairSubmit}
        className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative space-y-4 text-slate-100"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-md font-bold text-slate-100">Pair New Display</h3>
        {error && (
          <div className="text-xs text-red-400 bg-red-950/20 border border-red-900 p-2 rounded">
            {error}
          </div>
        )}
        <div className="space-y-1">
          <label className="block text-xs text-slate-400">
            4-Character Pairing Code
          </label>
          <input
            type="text"
            maxLength={4}
            required
            value={pairingCode}
            onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
            placeholder="E.g. X1Y3"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-mono tracking-widest text-slate-100 uppercase"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-slate-400">Display Name</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="E.g. Bar TV Left"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Pairing..." : "Confirm Pairing"}
        </Button>
      </form>
    </div>
  );
};
