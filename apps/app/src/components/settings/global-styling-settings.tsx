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
                  onClick={() => { if (!tokens.primaryColor) setTokens(prev => ({ ...prev, primaryColor: "#00f0ff" })) }}
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
                  onClick={() => { if (!tokens.accentColor) setTokens(prev => ({ ...prev, accentColor: "#00f0ff" })) }}
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
          <div className="grid grid-cols-1 gap-4">
            {/* Heading */}
            <div className="space-y-2 border border-white/5 rounded-xl p-4 bg-zinc-900/30">
              <div className="text-xs font-bold text-zinc-300">Heading Typography</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Font Family</label>
                  <select
                    value={tokens.headingFont || ""}
                    onChange={(e) => setTokens(prev => ({ ...prev, headingFont: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
                  >
                    <option value="">Default Font</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Oswald">Oswald</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Lora">Lora</option>
                    <option value="Lato">Lato</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Nunito">Nunito</option>
                    <option value="Raleway">Raleway</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/i.test(tokens.headingColor || "") ? tokens.headingColor : "#ffffff"}
                      onChange={(e) => setTokens(prev => ({ ...prev, headingColor: e.target.value }))}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      placeholder="e.g. #ffffff"
                      value={tokens.headingColor || ""}
                      onChange={(e) => setTokens(prev => ({ ...prev, headingColor: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Weight</label>
                  <select
                    value={tokens.headingWeight || ""}
                    onChange={(e) => setTokens(prev => ({ ...prev, headingWeight: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
                  >
                    <option value="">Default</option>
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="100">100 - Thin</option>
                    <option value="300">300 - Light</option>
                    <option value="500">500 - Medium</option>
                    <option value="700">700 - Bold</option>
                    <option value="900">900 - Black</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <div className="space-y-2 border border-white/5 rounded-xl p-4 bg-zinc-900/30">
              <div className="text-xs font-bold text-zinc-300">Subtitle Typography</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Font Family</label>
                  <select
                    value={tokens.subtitleFont || ""}
                    onChange={(e) => setTokens(prev => ({ ...prev, subtitleFont: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
                  >
                    <option value="">Default Font</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Oswald">Oswald</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Lora">Lora</option>
                    <option value="Lato">Lato</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Nunito">Nunito</option>
                    <option value="Raleway">Raleway</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/i.test(tokens.subtitleColor || "") ? tokens.subtitleColor : "#ffffff"}
                      onChange={(e) => setTokens(prev => ({ ...prev, subtitleColor: e.target.value }))}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      placeholder="e.g. #ffffff"
                      value={tokens.subtitleColor || ""}
                      onChange={(e) => setTokens(prev => ({ ...prev, subtitleColor: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Weight</label>
                  <select
                    value={tokens.subtitleWeight || ""}
                    onChange={(e) => setTokens(prev => ({ ...prev, subtitleWeight: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
                  >
                    <option value="">Default</option>
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="100">100 - Thin</option>
                    <option value="300">300 - Light</option>
                    <option value="500">500 - Medium</option>
                    <option value="700">700 - Bold</option>
                    <option value="900">900 - Black</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-2 border border-white/5 rounded-xl p-4 bg-zinc-900/30">
              <div className="text-xs font-bold text-zinc-300">Body Typography</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Font Family</label>
                  <select
                    value={tokens.bodyFont || ""}
                    onChange={(e) => setTokens(prev => ({ ...prev, bodyFont: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
                  >
                    <option value="">Default Font</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Oswald">Oswald</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Lora">Lora</option>
                    <option value="Lato">Lato</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Nunito">Nunito</option>
                    <option value="Raleway">Raleway</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/i.test(tokens.bodyColor || "") ? tokens.bodyColor : "#ffffff"}
                      onChange={(e) => setTokens(prev => ({ ...prev, bodyColor: e.target.value }))}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      placeholder="e.g. #ffffff"
                      value={tokens.bodyColor || ""}
                      onChange={(e) => setTokens(prev => ({ ...prev, bodyColor: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Weight</label>
                  <select
                    value={tokens.bodyWeight || ""}
                    onChange={(e) => setTokens(prev => ({ ...prev, bodyWeight: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-all"
                  >
                    <option value="">Default</option>
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="100">100 - Thin</option>
                    <option value="300">300 - Light</option>
                    <option value="500">500 - Medium</option>
                    <option value="700">700 - Bold</option>
                    <option value="900">900 - Black</option>
                  </select>
                </div>
              </div>
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
