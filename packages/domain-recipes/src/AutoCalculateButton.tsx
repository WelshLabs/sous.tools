import React from "react";

interface AutoCalculateButtonProps {
  onAutoCalculate: () => void;
}

export const AutoCalculateButton: React.FC<AutoCalculateButtonProps> = ({
  onAutoCalculate,
}) => {
  return (
    <button
      type="button"
      onClick={onAutoCalculate}
      className="text-xs px-3 py-2.5 rounded-lg transition-colors cursor-pointer font-semibold border"
      style={{
        backgroundColor: "var(--color-secondary)",
        borderColor: "var(--color-border)",
        color: "var(--color-primary)",
      }}
    >
      Auto-Calc Volume
    </button>
  );
};
