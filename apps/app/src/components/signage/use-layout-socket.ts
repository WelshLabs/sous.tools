"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { SignageLayoutConfig } from "@soustools/api-types";
import { config } from "@soustools/config";

export function useLayoutSocket(
  deckId: string | undefined,
  onConfigUpdated: (config: SignageLayoutConfig) => void
) {
  useEffect(() => {
    if (!deckId) return;

    const socketUrl = config.API_BASE_URL || window.location.origin;
    const socket = io(socketUrl, {
      query: { deckId },
    });

    socket.on("connect", () => {
      socket.emit("join", { deckId });
    });

    socket.on("deck_updated", (payload: { deckId: string; config: SignageLayoutConfig }) => {
      if (payload.deckId === deckId) {
        onConfigUpdated(payload.config);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [deckId, onConfigUpdated]);
}
