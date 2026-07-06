"use client";

import React, { useState } from "react";
import { PinInput, Button } from "@soustools/design-system";
import { Watch } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function TeamPortalPage() {
  const [pairingCode, setPairingCode] = useState("");
  const [status, setStatus] = useState<"idle" | "pairing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handlePairWatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pairingCode.length !== 6) return;

    setStatus("pairing");
    setMessage("Pairing smartwatch...");

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch("/api/devices/pair/confirm", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          code: pairingCode.toUpperCase(),
          deviceType: 'wearos'
        }),
      });

      if (!response.ok) {
        throw new Error("Pairing failed");
      }
      
      setStatus("success");
      setMessage("Smartwatch successfully paired!");
      setPairingCode("");
    } catch (err) {
      setStatus("error");
      setMessage("Failed to pair smartwatch. Please check the code and try again.");
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto w-full h-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-widest">Team Portal</h1>
        <p className="text-muted-foreground font-medium">Manage your devices and preferences.</p>
      </div>

      <div className="bg-card border border-zinc-800 p-6 rounded-2xl flex flex-col gap-6 w-full max-w-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Watch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Pair Smartwatch</h2>
            <p className="text-muted-foreground text-sm">Enter the 6-digit code shown on your WearOS device.</p>
          </div>
        </div>

        <form onSubmit={handlePairWatch} className="flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pairing Code</label>
            <PinInput
              length={6}
              value={pairingCode}
              onChange={setPairingCode}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={status === "pairing" || pairingCode.length !== 6}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold"
          >
            {status === "pairing" ? "Pairing..." : "Pair Device"}
          </Button>
        </form>

        {(message && status !== "idle") && (
          <div className={`p-4 rounded-xl text-sm text-center border ${
            status === "success" ? "bg-cyan-400/10 border-cyan-400/20 text-cyan-400" : 
            status === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : 
            "bg-zinc-800/50 border-zinc-700 text-muted-foreground"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
