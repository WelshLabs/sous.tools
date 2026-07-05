"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@soustools/design-system";
import { supabase } from "../../lib/supabase";
import { KeyRound, Mail, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("conar@dtown.cafe");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get("returnTo");
        router.push(returnTo ? returnTo : "/home");
      }
    } catch (err: unknown) {
      setError("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "6s" }} />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/30 mb-4 shadow-lg shadow-sky-500/10">
            <Sparkles className="w-6 h-6 text-sky-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight text-center">
            Kitchen Portal
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 text-center">
            Standardize your culinary operations in real-time.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center font-medium animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <input
              type="email"
              placeholder="name@dtown.cafe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
            />
          </div>

          <div className="pt-2">
            <Button disabled={loading} className="w-full justify-center py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/20">
              {loading ? "Signing In..." : "Access Control"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
