"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle } from "lucide-react";
import { Button, Input, PrimaryLogo } from "@soustools/design-system";
import { clientConfig } from "@soustools/config/client";
import { createApiClient } from "@soustools/api-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = createApiClient({ baseUrl: clientConfig.NEXT_PUBLIC_API_URL });

  // On mount, we might receive `code=` in the URL query string from Supabase
  const [code, setCode] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // If the URL has ?code=..., grab it
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setCode(codeParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setStatus("error");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const { error } = await (api as any).POST("/auth/reset-password", {
        body: { password, code: code || undefined },
      });

      if (error) {
        setErrorMessage(error.message || "Failed to reset password.");
        setStatus("error");
      } else {
        setStatus("success");
        // Wait a moment then redirect to home
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a] p-4 font-sans relative overflow-hidden">
        <div className="absolute top-8 left-8 flex items-center gap-3 select-none">
          <PrimaryLogo gradient className="w-8 h-8 md:w-10 md:h-10 text-zinc-950 dark:text-zinc-100" />
          <span className="font-extrabold tracking-tight text-xl text-zinc-950 dark:text-zinc-100 hidden sm:block">
            sous.tools
          </span>
        </div>
        <div className="w-full max-w-[420px] bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          <CheckCircle className="w-16 h-16 text-emerald-500 mb-6" />
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100 tracking-tight">Password Reset!</h2>
          <p className="text-zinc-500 mt-2">Your password has been successfully updated.</p>
          <p className="text-sm text-zinc-400 mt-6">Redirecting you to the dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a] p-4 font-sans relative overflow-hidden">
      <div className="absolute top-8 left-8 flex items-center gap-3 select-none">
        <PrimaryLogo gradient className="w-8 h-8 md:w-10 md:h-10 text-zinc-950 dark:text-zinc-100" />
        <span className="font-extrabold tracking-tight text-xl text-zinc-950 dark:text-zinc-100 hidden sm:block">
          sous.tools
        </span>
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-[1.5rem] shadow-xl p-8 sm:p-10 relative overflow-hidden">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-zinc-950 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-cyan-500" /> Reset Password
            </h1>
            <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {status === "error" && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="text-red-500 text-sm font-semibold">{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10 h-12 w-full text-base bg-zinc-50 dark:bg-[#0a0a0a] border-black/10 dark:border-white/10"
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10 h-12 w-full text-base bg-zinc-50 dark:bg-[#0a0a0a] border-black/10 dark:border-white/10"
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-4" />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-3.5 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 mt-4 text-base font-bold tracking-wide"
              disabled={status === "loading" || !password || !confirmPassword}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
