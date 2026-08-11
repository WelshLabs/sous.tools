"use client";

import { useState } from "react";
import { Button, PinInput } from "@soustools/design-system";
import { X } from "lucide-react";

export interface PairDisplayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onPairDisplay?: (pairingCode: string, name: string) => Promise<void>;
}

/**
 * PairDisplayDialog is a modal dialog that prompts the user for a 6-character pairing code
 * to connect a digital signage device to their organization.
 *
 * @tenant-docs-export
 * Use the Pair Display Dialog to securely connect a new hardware screen/device using a 6-digit pairing code.
 */
export const PairDisplayDialog: React.FC<PairDisplayDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onPairDisplay,
}) => {
  const [pairingCode, setPairingCode] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePairSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (pairingCode.length !== 6) {
      setError("Pairing code must be exactly 6 characters.");
      return;
    }
    if (!onPairDisplay) return;

    setSubmitting(true);
    setError(null);
    try {
      await onPairDisplay(pairingCode.toUpperCase(), displayName);
      setPairingCode("");
      setDisplayName("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Network error. Failed to confirm pairing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <form
        onSubmit={handlePairSubmit}
        className="w-full max-w-sm bg-card border border-border p-6 rounded-2xl shadow-2xl relative space-y-4 text-foreground"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-md font-bold text-foreground">Pair New Display</h3>
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2 rounded">
            {error}
          </div>
        )}
        <div className="space-y-1">
          <label className="block text-xs text-muted-foreground">
            6-Character Pairing Code
          </label>
          <PinInput
            length={6}
            value={pairingCode}
            onChange={(val) => setPairingCode(val.toUpperCase())}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-muted-foreground">Display Name</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="E.g. Bar TV Left"
            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-xs text-foreground focus:ring-ring focus:border-ring"
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Pairing..." : "Confirm Pairing"}
        </Button>
      </form>
    </div>
  );
};
