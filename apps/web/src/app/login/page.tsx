"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  PrimaryLogo,
  Input,
  GoogleIcon,
  GitHubIcon,
  LoginButton,
  type LoginState,
  AuroraBackground,
} from "@soustools/design-system";
import { api } from "@soustools/api-client";
import { clientConfig } from "@soustools/config/client";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";

export default function LoginPage() {
  const [state, setState] = React.useState<LoginState>("idle");
  const [showPw, setShowPw] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(true);

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotState, setForgotState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [forgotError, setForgotError] = useState("");

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
    if (loading) return;

    setError("");
    setState("loading");
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
        setState("error");
      } else {
        setState("success");
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get("returnTo");
        router.push(returnTo ? returnTo : "/home");
      }
    } catch (_err: unknown) {
      setError("An unexpected error occurred during login.");
      setState("error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (forgotState === "loading") return;
    setForgotError("");
    setForgotState("loading");
    try {
      // Route through NestJS — the backend calls Supabase's password reset.
      // The /auth/forgot-password endpoint may not yet be in the OpenAPI schema;
      // we cast to `any` to bypass the generated types until the schema is re-synced.
      const { data, error: apiError } = await (api as any).POST(
        "/auth/forgot-password",
        {
          body: { email: forgotEmail },
        },
      );
      if (apiError || !data?.success) {
        const payload = apiError as { message?: string } | undefined;
        setForgotError(
          payload?.message || "Could not send reset email. Please try again.",
        );
        setForgotState("error");
      } else {
        setForgotState("success");
      }
    } catch {
      setForgotError("An unexpected error occurred. Please try again.");
      setForgotState("error");
    }
  };

  const handleOAuth = (provider: "google" | "github") => {
    // The NestJS backend initiates the Supabase OAuth handshake and sets
    // the HttpOnly session cookies — the frontend only triggers the redirect.
    window.location.href = `${clientConfig.NEXT_PUBLIC_API_URL}/auth/${provider}`;
  };

  const closeForgotModal = () => {
    setForgotOpen(false);
    setForgotEmail("");
    setForgotState("idle");
    setForgotError("");
  };

  if (redirecting) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-background"
      >
        <AuroraBackground />

        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-border shadow-2xl relative z-[var(--z-overlay)]">
          <div className="flex flex-col items-center mb-8">
            <PrimaryLogo gradient className="h-16 w-auto mb-4" />
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
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              trailing={
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw((s) => !s)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2 text-muted-foreground">
                <input
                  type="checkbox"
                  className="accent-[color:var(--primary)]"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotOpen(true);
                }}
                className="text-primary transition-opacity hover:opacity-80 bg-transparent border-none cursor-pointer p-0"
              >
                Forgot password?
              </button>
            </div>

            <LoginButton state={state} />
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            OR
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="glass"
              className="flex-1"
              onClick={() => handleOAuth("google")}
            >
              <GoogleIcon className="h-[18px] w-[18px]" />
              Google
            </Button>
            <Button
              type="button"
              variant="glass"
              className="flex-1"
              onClick={() => handleOAuth("github")}
            >
              <GitHubIcon className="h-[18px] w-[18px]" />
              GitHub
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <a
              href="#"
              className="text-primary transition-opacity hover:opacity-80"
            >
              Create an account
            </a>
          </p>
        </div>
      </motion.div>

      {/* ── Forgot Password Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            key="forgot-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-6 bg-background/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeForgotModal();
            }}
          >
            <motion.div
              key="forgot-panel"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm glass-panel p-8 rounded-2xl border border-border shadow-2xl relative"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={closeForgotModal}
                className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {forgotState === "success" ? (
                <div className="text-center py-4">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10">
                    <Mail className="h-6 w-6 text-sky-400" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground mb-2">
                    Check your inbox
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    If an account exists for{" "}
                    <span className="font-medium text-foreground">
                      {forgotEmail}
                    </span>
                    , you'll receive a password reset link shortly.
                  </p>
                  <Button
                    type="button"
                    variant="glass"
                    className="mt-6 w-full"
                    onClick={closeForgotModal}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Reset your password
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Enter your email and we'll send you a reset link.
                    </p>
                  </div>

                  {forgotError && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium">
                      {forgotError}
                    </div>
                  )}

                  <Input
                    label="Email"
                    type="email"
                    autoComplete="email"
                    icon={<Mail className="h-4 w-4" />}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={forgotState === "loading" || !forgotEmail}
                  >
                    {forgotState === "loading" ? "Sending…" : "Send reset link"}
                  </Button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
