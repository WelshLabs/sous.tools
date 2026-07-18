import React from "react";
import { Button } from "@soustools/design-system";

interface ActionButtonsProps {
  loading: boolean;
  onCancel: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  loading,
  onCancel,
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
