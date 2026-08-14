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
    <div className="bg-background/70 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handlePairSubmit}
        className="bg-card border-border text-foreground relative w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-md text-foreground font-bold">Pair New Display</h3>
        {error && (
          <div className="text-destructive bg-destructive/10 border-destructive/20 rounded border p-2 text-xs">
            {error}
          </div>
        )}
        <div className="space-y-1">
          <label className="text-muted-foreground block text-xs">
            6-Character Pairing Code
          </label>
          <PinInput
            length={6}
            value={pairingCode}
            onChange={(val) => setPairingCode(val.toUpperCase())}
          />
        </div>
        <div className="space-y-1">
          <label className="text-muted-foreground block text-xs">
            Display Name
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="E.g. Bar TV Left"
            className="bg-background border-input text-foreground focus:ring-ring focus:border-ring w-full rounded-lg border px-3 py-2 text-xs"
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Pairing..." : "Confirm Pairing"}
        </Button>
      </form>
    </div>
  );
};
