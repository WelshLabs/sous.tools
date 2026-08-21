"use client";

import React, { useState } from "react";
import { api } from "@soustools/api-client";
import { TeamPortalView } from "./TeamPortal.view";

export function TeamPortalContainer() {
  const [pairingCode, setPairingCode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "pairing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handlePairWatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pairingCode.length !== 6) return;

    setStatus("pairing");
    setMessage("Pairing smartwatch...");

    try {
      const { error } = await (api as any).POST("/devices/pair/confirm", {
        body: {
          code: pairingCode.toUpperCase(),
          deviceType: "wearos",
        },
      });

      if (error) {
        throw new Error(
          typeof error === "string" ? error : JSON.stringify(error),
        );
      }

      setStatus("success");
      setMessage("Smartwatch successfully paired!");
      setPairingCode("");
    } catch (_err) {
      setStatus("error");
      setMessage(
        "Failed to pair smartwatch. Please check the code and try again.",
      );
    }
  };

  return (
    <TeamPortalView
      pairingCode={pairingCode}
      setPairingCode={setPairingCode}
      status={status}
      message={message}
      onSubmit={handlePairWatch}
    />
  );
}
TeamPortalContainer.displayName = "TeamPortalContainer";

export { TeamPortalContainer as TeamPortal };
