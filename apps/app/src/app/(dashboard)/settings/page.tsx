"use client";

import React, { useState, useEffect } from "react";
import { IntegrationsPanel } from "../../../components/settings/integrations-panel";
import { GlobalStylingSettings } from "../../../components/settings/global-styling-settings";
import { GeneralSettings } from "../../../components/settings/general-settings";
import { DownloadsPanel } from "../../../components/settings/downloads-panel";
import { Settings, Sliders, Cable, Paintbrush } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "integrations" | "styling" | "downloads">("general");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "integrations") {
        setActiveTab("integrations");
      } else if (tab === "styling") {
        setActiveTab("styling");
      } else if (tab === "downloads") {
        setActiveTab("downloads");
      }
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-zinc-900 dark:text-slate-100">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-zinc-900 dark:text-slate-100">
          <Settings className="w-6 h-6 text-sky-500 animate-pulse" />
          Settings Panel
        </h1>
        <p className="text-xs text-slate-400">
          Configure global kitchen parameters, system integration profiles, and tenant design tokens.
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
        <button
          onClick={() => setActiveTab("styling")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "styling"
              ? "border-sky-500 text-sky-400 bg-sky-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-zinc-900/40"
          }`}
        >
          <Paintbrush className="w-4 h-4" />
          Global Styling
        </button>
        <button
          onClick={() => setActiveTab("downloads")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "downloads"
              ? "border-sky-500 text-sky-400 bg-sky-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-zinc-900/40"
          }`}
        >
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Downloads
        </button>
      </div>

      {/* Panels Layout Container */}
      <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 shadow-2xl backdrop-blur-2xl">
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "integrations" && <IntegrationsPanel />}
        {activeTab === "styling" && <GlobalStylingSettings />}
        {activeTab === "downloads" && <DownloadsPanel />}
      </div>
    </div>
  );
}
