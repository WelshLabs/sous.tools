"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@soustools/ui";
import { User, Mail, Shield, Save, Loader2, Key, Check, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const SettingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SettingsFormValues = z.infer<typeof SettingsSchema>;

export const GeneralSettings: React.FC = () => {
  const [role, setRole] = useState("member");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

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
          setValue("email", user.email || "");

          // Load full name from user_profiles table
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("full_name")
            .eq("user_id", user.id)
            .limit(1)
            .single();
          if (profile?.full_name) {
            setValue("name", profile.full_name);
          } else {
            // Fallback to metadata
            const meta: any = (user.user_metadata as any) || {};
            setValue("name", meta.fullName || meta.name || "");
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

  const onSubmit = async (data: SettingsFormValues) => {
    setSaving(true);
    setSuccess(false);
    setServerError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      // Update auth user (email, metadata, password optional)
      const updatePayload: any = { data: { fullName: data.name } };
      if (data.email) updatePayload.email = data.email;
      if (data.password) {
        updatePayload.password = data.password;
      }

      const { error: authErr } = await supabase.auth.updateUser(updatePayload);
      if (authErr) throw authErr;

      // Save full_name to user_profiles table
      const { error: profileErr } = await supabase
        .from("user_profiles")
        .upsert(
          { user_id: session.user.id, full_name: data.name },
          { onConflict: "user_id" },
        );
      if (profileErr) throw profileErr;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to save settings", err);
      setServerError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl animate-fadeIn">
      {success && (
        <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-400 text-sm">
          General settings saved successfully!
        </div>
      )}
      {serverError && (
        <div className="p-4 rounded-xl border bg-rose-950/20 border-rose-500/30 text-rose-400 text-sm">
          {serverError}
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
            {...register("name")}
            className={`w-full bg-zinc-50 dark:bg-zinc-950 border ${errors.name ? 'border-rose-500' : 'border-zinc-800'} rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all`}
          />
          {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            className={`w-full bg-zinc-50 dark:bg-zinc-950 border ${errors.email ? 'border-rose-500' : 'border-zinc-800'} rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all`}
          />
          {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Role display (read-only) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Role
          </label>
          <div className="w-full rounded-xl border border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm text-slate-200">
            {role === "admin" ? "Admin" : "Member"}
          </div>
        </div>

        {/* Password */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> New Password
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="Leave blank to keep current password"
              className={`w-full bg-zinc-50 dark:bg-zinc-950 border ${errors.password ? 'border-rose-500' : 'border-zinc-800'} rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all`}
            />
            {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 flex justify-between items-center">
              <span>Confirm Password</span>
              {password && confirmPassword && (
                password === confirmPassword ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Passwords match
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                    <X className="w-3 h-3" /> Passwords mismatch
                  </span>
                )
              )}
            </label>
            <div className="relative">
              <input
                type="password"
                {...register("confirmPassword")}
                placeholder="Confirm new password"
                className={`w-full bg-zinc-50 dark:bg-zinc-950 border ${errors.confirmPassword ? 'border-rose-500' : 'border-zinc-800'} rounded-xl px-4 py-2.5 pr-10 text-sm text-zinc-900 dark:text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all`}
              />
              {password && confirmPassword && (
                <div className="absolute right-3 top-3 flex items-center pointer-events-none">
                  {password === confirmPassword ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              )}
            </div>
            {errors.confirmPassword && <p className="text-rose-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
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
