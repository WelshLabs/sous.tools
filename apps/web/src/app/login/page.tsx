"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@soustools/design-system";
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
      // POST credentials to the NestJS API — it calls Supabase and sets an
      // HttpOnly cookie. The frontend never touches a raw Supabase token.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError((payload as { message?: string }).message || "Invalid email or password.");
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get("returnTo");
        router.push(returnTo ? returnTo : "/home");
      }
    } catch (_err: unknown) {
      setError("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-background">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "6s" }} />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-border shadow-2xl relative z-[var(--z-overlay)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/30 mb-4 shadow-lg shadow-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight text-center">
            Kitchen Portal
          </h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Standardize your culinary operations in real-time.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <input
              type="email"
              placeholder="name@dtown.cafe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="pt-2">
            <Button disabled={loading} className="w-full justify-center py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-lg shadow-primary/20">
              {loading ? "Signing In..." : "Access Control"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
