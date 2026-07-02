"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SignageLayoutConfig } from "@soustools/api-types";

export function useLayoutDraft(
  deckId: string | undefined,
  config: SignageLayoutConfig,
  setConfig: (config: SignageLayoutConfig) => void,
  savedConfig: SignageLayoutConfig | null
) {
  const [isDraft, setIsDraft] = useState(false);
  const localStorageKey = deckId ? `signage-draft-${deckId}` : "";
  const isInitialMount = useRef(true);

  // Load draft on mount/deckId change
  useEffect(() => {
    if (!localStorageKey) return;
    const cached = localStorage.getItem(localStorageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as SignageLayoutConfig;
        setConfig(parsed);
        setIsDraft(true);
      } catch (err) {
        console.error("Failed to parse cached draft config", err);
      }
    } else {
      setIsDraft(false);
    }
    isInitialMount.current = true;
  }, [localStorageKey, setConfig]);

  // Debounced auto-save to localStorage
  useEffect(() => {
    if (!localStorageKey || isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const isDifferent = savedConfig ? JSON.stringify(config) !== JSON.stringify(savedConfig) : true;
      if (isDifferent) {
        localStorage.setItem(localStorageKey, JSON.stringify(config));
        setIsDraft(true);
      } else {
        localStorage.removeItem(localStorageKey);
        setIsDraft(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [config, localStorageKey, savedConfig]);

  // Sync draft state with database saved config instantly for non-debounced UI feedback
  useEffect(() => {
    if (!savedConfig) return;
    const isDifferent = JSON.stringify(config) !== JSON.stringify(savedConfig);
    setIsDraft(isDifferent);
  }, [config, savedConfig]);

  const discardDraft = useCallback(() => {
    if (!localStorageKey || !savedConfig) return;
    localStorage.removeItem(localStorageKey);
    setConfig(savedConfig);
    setIsDraft(false);
  }, [localStorageKey, savedConfig, setConfig]);

  const clearDraftOnSave = useCallback(() => {
    if (!localStorageKey) return;
    localStorage.removeItem(localStorageKey);
    setIsDraft(false);
  }, [localStorageKey]);

  return { isDraft, discardDraft, clearDraftOnSave };
}
