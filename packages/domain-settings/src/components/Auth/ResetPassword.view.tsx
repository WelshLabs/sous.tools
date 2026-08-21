"use client";

import React from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { Button, Input, PrimaryLogo } from "@soustools/design-system";

export interface ResetPasswordViewProps {
  status: "idle" | "loading" | "success" | "error";
  errorMessage: string;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  showConfirm: boolean;
  setShowConfirm: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ResetPasswordView({
  status,
  errorMessage,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirm,
  setShowConfirm,
  onSubmit,
}: ResetPasswordViewProps) {
  if (status === "success") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 p-4 font-sans dark:bg-[#0a0a0a]">
        <div className="absolute top-8 left-8 flex items-center gap-3 select-none">
          <PrimaryLogo
            gradient
            className="h-8 w-8 text-zinc-950 md:h-10 md:w-10 dark:text-zinc-100"
          />
          <span className="hidden text-xl font-extrabold tracking-tight text-zinc-950 sm:block dark:text-zinc-100">
            sous.tools
          </span>
        </div>
        <div className="animate-in fade-in zoom-in flex w-full max-w-[420px] flex-col items-center rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xl duration-300 dark:border-white/10 dark:bg-[#111111]">
          <CheckCircle className="mb-6 h-16 w-16 text-emerald-500" />
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100">
            Password Reset!
          </h2>
          <p className="mt-2 text-zinc-500">
            Your password has been successfully updated.
          </p>
          <p className="mt-6 text-sm text-zinc-400">
            Redirecting you to the dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 p-4 font-sans dark:bg-[#0a0a0a]">
      <div className="absolute top-8 left-8 flex items-center gap-3 select-none">
        <PrimaryLogo
          gradient
          className="h-8 w-8 text-zinc-950 md:h-10 md:w-10 dark:text-zinc-100"
        />
        <span className="hidden text-xl font-extrabold tracking-tight text-zinc-950 sm:block dark:text-zinc-100">
          sous.tools
        </span>
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-black/10 bg-white p-8 shadow-xl sm:p-10 dark:border-white/10 dark:bg-[#111111]">
          <div className="mb-8">
            <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-zinc-950 dark:text-zinc-100">
              <ShieldCheck className="h-8 w-8 text-cyan-500" /> Reset Password
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {status === "error" && (
              <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                <span className="text-sm font-semibold text-red-500">
                  {errorMessage}
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative space-y-1.5">
                <label className="ml-1 text-xs font-bold tracking-wider text-zinc-500 uppercase">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 w-full border-black/10 bg-zinc-50 pl-10 text-base dark:border-white/10 dark:bg-[#0a0a0a]"
                  />
                  <Lock className="absolute top-4 left-3.5 h-4 w-4 text-zinc-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3.5 right-3.5 p-0.5 text-zinc-400 hover:text-zinc-600 focus:outline-none dark:hover:text-zinc-300"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="relative space-y-1.5">
                <label className="ml-1 text-xs font-bold tracking-wider text-zinc-500 uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 w-full border-black/10 bg-zinc-50 pl-10 text-base dark:border-white/10 dark:bg-[#0a0a0a]"
                  />
                  <Lock className="absolute top-4 left-3.5 h-4 w-4 text-zinc-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute top-3.5 right-3.5 p-0.5 text-zinc-400 hover:text-zinc-600 focus:outline-none dark:hover:text-zinc-300"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-4 h-12 w-full text-base font-bold tracking-wide"
              disabled={status === "loading" || !password || !confirmPassword}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
