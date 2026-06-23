"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@soustools/ui";
import { User, Mail, Shield, Save, Loader2, Key } from "lucide-react";
import { supabase } from "../../lib/supabase";

export const GeneralSettings: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (user) {
          setEmail(user.email || "");

          // Load full name from user_profiles table
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("full_name")
            .eq("user_id", user.id)
            .limit(1)
            .single();
          if (profile?.full_name) {
            setName(profile.full_name);
          } else {
            // Fallback to metadata
            const meta: any = (user.user_metadata as any) || {};
            setName(meta.fullName || meta.name || "");
          }
        }

        // fetch user's org and membership role (assumes single org per tenant)
        const { data: orgData } = await supabase
          .from("organizations")
          .select("id")
          .limit(1)
          .single();
        if (orgData?.id && user) {
          const { data: membership } = await supabase
            .from("org_members")
            .select("role")
            .eq("organization_id", orgData.id)
            .eq("user_id", user.id)
            .limit(1)
            .single();
          if (membership?.role) setRole(membership.role);
        }
      } catch (err) {
        console.error("Failed to load user settings", err);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      // Update auth user (email, metadata, password optional)
      const updatePayload: any = { data: { fullName: name } };
      if (email) updatePayload.email = email;
      if (password) {
        if (password !== confirmPassword)
          throw new Error("Passwords do not match");
        updatePayload.password = password;
      }

      const { error: authErr } = await supabase.auth.updateUser(updatePayload);
      if (authErr) throw authErr;

      // Save full_name to user_profiles table
      const { error: profileErr } = await supabase
        .from("user_profiles")
        .upsert(
          { user_id: session.user.id, full_name: name },
          { onConflict: "user_id" },
        );
      if (profileErr) throw profileErr;

      // Ensure org_members role reflects selected role (for current org)
      const { data: orgData } = await supabase
        .from("organizations")
        .select("id")
        .limit(1)
        .single();
      if (orgData?.id) {
        await supabase
          .from("org_members")
          .upsert({
            organization_id: orgData.id,
            user_id: session.user.id,
            role,
          })
          .eq("organization_id", orgData.id)
          .eq("user_id", session.user.id);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to save settings", err);
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl animate-fadeIn">
      {success && (
        <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-400 text-sm">
          General settings saved successfully!
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl border bg-rose-950/20 border-rose-500/30 text-rose-400 text-sm">
          {error}
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
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Password */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
};
