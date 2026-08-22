"use client";

import { motion } from "framer-motion";
import { OmnibarPerimeterView } from "./OmnibarPerimeterView";
import { AnimatedLettermark, Lettermark } from "../Logos/Logo";
import { useOmnibarContext } from "./OmniBarContext";

export interface OmniButtonProps {
  onClick?: () => void;
  isProcessing?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function OmniButton({
  onClick,
  isProcessing: propProcessing,
  className = "",
  size = "md",
}: OmniButtonProps) {
  const { isOpen, setIsOpen, isProcessing: ctxProcessing } = useOmnibarContext();
  const isProcessing = propProcessing ?? ctxProcessing;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsOpen(!isOpen);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-omnibar", { detail: true }));
      }
    }
  };

  const sizeClasses =
    size === "sm"
      ? "h-9 w-9"
      : size === "lg"
        ? "h-14 w-14"
        : "h-11 w-11";

  const iconSize =
    size === "sm"
      ? "h-5 w-5"
      : size === "lg"
        ? "h-8 w-8"
        : "h-6 w-6";

  return (
    <motion.button
      type="button"
      aria-label="Ask Sous Chef (⌘K)"
      title="Ask Sous Chef (⌘K)"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={handleClick}
      className={`ds-glass relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-lg transition-all ${sizeClasses} ${className}`}
      style={{
        borderRadius: "9999px",
        borderColor: isProcessing
          ? "var(--color-primary)"
          : "var(--color-border)",
      }}
    >
      <OmnibarPerimeterView busy={isProcessing} />
      {isProcessing ? (
        <AnimatedLettermark
          gradient
          duration={1.65}
          className={`relative z-10 ${iconSize}`}
        />
      ) : (
        <Lettermark gradient className={`relative z-10 ${iconSize}`} />
      )}
    </motion.button>
  );
}
