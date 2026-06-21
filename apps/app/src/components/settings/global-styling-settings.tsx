"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@soustools/ui";
import { Type, Code, Save, Loader2, Palette } from "lucide-react";
import { createBrowserClient } from "@soustools/supabase";
import { GlobalDesignTokens } from "@soustools/api-types";

export const GlobalStylingSettings: React.FC = () => {
  const [tokens, setTokens] = useState<GlobalDesignTokens>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const { data } = await supabase
        .from("organizations")
        .select("design_tokens")
        .limit(1)
        .single();
        
      if (data?.design_tokens) {
        setTokens(data.design_tokens);
      }
      setLoading(false);
    };
    fetchTokens();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { data: orgData } = await supabase
        .from("organizations")
        .select("id")
        .limit(1)
        .single();

      if (orgData) {
        await supabase
          .from("organizations")
          .update({ design_tokens: tokens as any })
          .eq("id", orgData.id);
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save tokens", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-zinc-500 animate-pulse text-sm">Loading design tokens...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl animate-fadeIn">
      {success && (
        <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-400 text-sm">
          Global styling settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2 border-b border-white/5 pb-2">
            <Palette className="w-4 h-4 text-cyan-400" />
            Brand Colors
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Primary Color (OKLCH, HEX, RGB)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/i.test(tokens.primaryColor || "") ? tokens.primaryColor : "#00f0ff"}
                  onChange={(e) => setTokens(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  placeholder="e.g. oklch(0.7 0.15 200) or #00f0ff"
                  value={tokens.primaryColor || ""}
                  onChange={(e) => setTokens(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/i.test(tokens.accentColor || "") ? tokens.accentColor : "#00f0ff"}
                  onChange={(e) => setTokens(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  placeholder="e.g. oklch(0.8 0.1 250)"
                  value={tokens.accentColor || ""}
                  onChange={(e) => setTokens(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2 border-b border-white/5 pb-2">
            <Type className="w-4 h-4 text-cyan-400" />
            Global Typography
          </h3>
          <datalist id="google-fonts-list">
            <option value="Inter" />
            <option value="Roboto" />
            <option value="Plus Jakarta Sans" />
            <option value="Outfit" />
            <option value="Oswald" />
            <option value="Playfair Display" />
            <option value="Merriweather" />
            <option value="Montserrat" />
            <option value="Lora" />
            <option value="Lato" />
            <option value="Poppins" />
            <option value="Nunito" />
            <option value="Raleway" />
          </datalist>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Heading Font</label>
              <input
                type="text"
                list="google-fonts-list"
                placeholder="e.g. Plus Jakarta Sans"
                value={tokens.headingFont || ""}
                onChange={(e) => setTokens(prev => ({ ...prev, headingFont: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Subtitle Font</label>
              <input
                type="text"
                list="google-fonts-list"
                placeholder="e.g. Outfit"
                value={tokens.subtitleFont || ""}
                onChange={(e) => setTokens(prev => ({ ...prev, subtitleFont: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Body Font</label>
              <input
                type="text"
                list="google-fonts-list"
                placeholder="e.g. Inter"
                value={tokens.bodyFont || ""}
                onChange={(e) => setTokens(prev => ({ ...prev, bodyFont: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Custom CSS */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2 border-b border-white/5 pb-2">
            <Code className="w-4 h-4 text-cyan-400" />
            Global Custom CSS
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Write raw CSS to define utility classes (e.g., .ambient-wrapper, .glass-panel, .menu-glow-text) 
            that can be attached to layout containers and blocks in the signage editor.
          </p>
          <div className="space-y-1">
            <textarea
              rows={8}
              placeholder=".glass-panel { backdrop-filter: blur(10px); }"
              value={tokens.globalCss || ""}
              onChange={(e) => setTokens(prev => ({ ...prev, globalCss: e.target.value }))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-sky-400 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-y"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold px-6">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Design Tokens"}
        </Button>
      </div>
    </form>
  );
};
