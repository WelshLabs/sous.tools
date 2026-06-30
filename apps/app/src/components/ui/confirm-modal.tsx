"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@soustools/ui";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
        onClick={!loading ? onCancel : undefined}
      />
      <div className="relative z-[101] bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 fade-in duration-200">
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-zinc-500 dark:text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`p-3 rounded-full ${isDestructive ? "bg-red-500/20 text-red-500" : "bg-amber-500/20 text-amber-500"}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{message}</p>
        </div>

        <div className="flex gap-3 mt-8">
          <Button 
            variant="outline" 
            className="flex-1 border-black/10 dark:border-white/10 hover:bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            className={`flex-1 ${isDestructive ? "bg-red-600 hover:bg-red-500 text-white" : ""}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Working..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
