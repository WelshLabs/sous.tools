"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, PrimaryLogo } from "@soustools/design-system";
import { KeyRound, Mail } from "lucide-react";
import { api } from "@soustools/api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("conar@dtown.cafe");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await api.GET("/auth/session");
        const payloadData = data?.data as Record<string, any> | undefined;
        if (data?.success && payloadData?.user) {
          router.replace("/home");
          return;
        }
      } catch (err) {
        console.error("Failed to check active session:", err);
      } finally {
        setRedirecting(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // POST credentials to the NestJS API — it calls Supabase and sets an
      // HttpOnly cookie. The frontend never touches a raw Supabase token.
      const { data, error: apiError } = await api.POST("/auth/login", {
        body: { email, password },
      });

      if (apiError || !data?.success) {
        const payload = apiError as { message?: string } | undefined;
        setError(payload?.message || "Invalid email or password.");
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

  if (redirecting) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-background">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "6s" }} />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-border shadow-2xl relative z-[var(--z-overlay)]">
        <div className="flex flex-col items-center mb-8">
          <PrimaryLogo className="h-16 w-auto text-primary mb-4" />
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight text-center">
            Sous Tools Login
          </h1>
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
