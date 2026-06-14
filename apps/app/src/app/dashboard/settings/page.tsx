"use client";

import React, { useState, useEffect } from "react";
import { IntegrationsPanel } from "../../../components/settings/integrations-panel";
import { GeneralSettings } from "../../../components/settings/general-settings";
import { Settings, Sliders, Cable } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "integrations">("general");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "integrations") {
        setActiveTab("integrations");
      }
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
          <Settings className="w-6 h-6 text-sky-500 animate-pulse" />
          Settings Panel
        </h1>
        <p className="text-xs text-slate-400">
          Configure global kitchen parameters and control system integration profiles.
        </p>
      </header>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-850 gap-1">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "general"
              ? "border-sky-500 text-sky-400 bg-sky-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-zinc-900/40"
          }`}
        >
          <Sliders className="w-4 h-4" />
          General Settings
        </button>
        <button
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "integrations"
              ? "border-sky-500 text-sky-400 bg-sky-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-zinc-900/40"
          }`}
        >
          <Cable className="w-4 h-4" />
          Integrations
        </button>
      </div>

      {/* Panels Layout Container */}
      <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 shadow-2xl backdrop-blur-2xl">
        {activeTab === "general" ? <GeneralSettings /> : <IntegrationsPanel />}
      </div>
    </div>
  );
}
