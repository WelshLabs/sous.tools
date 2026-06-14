"use client";

import React, { useState } from "react";
import { Button } from "@soustools/ui";
import { User, Mail, Shield, Save, Loader2 } from "lucide-react";

export const GeneralSettings: React.FC = () => {
  const [name, setName] = useState("Conar Welsh");
  const [email, setEmail] = useState("conar@example.com");
  const [role, setRole] = useState("Executive Chef");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl animate-fadeIn">
      {success && (
        <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-400 text-sm">
          General settings saved successfully!
        </div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
          />
        </div>

        {/* Role Selection */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Team Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
          >
            <option value="Executive Chef">Executive Chef</option>
            <option value="General Manager">General Manager</option>
            <option value="Kitchen Staff">Kitchen Staff</option>
            <option value="System Admin">System Admin</option>
          </select>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={saving} className="flex items-center gap-1.5">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
};
