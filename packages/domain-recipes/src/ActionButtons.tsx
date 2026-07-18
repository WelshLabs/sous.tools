import React from "react";
import { Button } from "@soustools/design-system";

interface ActionButtonsProps {
  loading: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  // inputStyle prop is not used in this component, consider removing if not needed elsewhere
  inputStyle?: React.CSSProperties;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  loading,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer"
        style={{
          backgroundColor: "var(--color-secondary)",
          color: "var(--color-foreground)",
        }}
      >
        Cancel
      </button>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Vessel"}
      </Button>
    </div>
  );
};
