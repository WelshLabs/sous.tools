"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@soustools/ui";
import { supabase } from "../../lib/supabase";

/**
 * LoginPage renders the authentication email/password form for kitchen/admin staff.
 * It uses oklch colors, the shared UI Button component, and signs in via Supabase.
 */
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
        router.push("/");
      }
    } catch (err: unknown) {
      setError("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-[oklch(0.12_0.01_220)]">
      <div className="w-full max-w-sm p-6 rounded-2xl shadow-xl bg-[oklch(0.18_0.02_220)] border border-[oklch(0.28_0.03_220)]">
        <h1 className="text-3xl font-bold mb-6 text-[oklch(0.85_0.1_140)] text-center">
          Kitchen Login
        </h1>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-200 text-sm text-center font-sans">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[oklch(0.75_0.03_220)]">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@dtown.cafe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-[oklch(0.14_0.01_220)] border border-[oklch(0.24_0.02_220)] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_140)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[oklch(0.75_0.03_220)]">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-[oklch(0.14_0.01_220)] border border-[oklch(0.24_0.02_220)] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_140)]"
            />
          </div>
          <div className="pt-2 flex justify-center">
            <Button disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

