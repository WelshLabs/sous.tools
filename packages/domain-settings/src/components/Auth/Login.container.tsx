"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type LoginState } from "@soustools/design-system";
import { api } from "@soustools/api-client";
import { clientConfig } from "@soustools/config/client";
import { LoginView } from "./Login.view";

export function LoginContainer() {
  const [state, setState] = useState<LoginState>("idle");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
      <main className="bg-background flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500/20 border-t-sky-500" />
      </main>
    );
  }

  return (
    <LoginView
      state={state}
      showPw={showPw}
      setShowPw={setShowPw}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      rememberMe={rememberMe}
      setRememberMe={setRememberMe}
      error={error}
      forgotOpen={forgotOpen}
      setForgotOpen={setForgotOpen}
      forgotEmail={forgotEmail}
      setForgotEmail={setForgotEmail}
      forgotState={forgotState}
      forgotError={forgotError}
      onLogin={handleLogin}
      onForgotPassword={handleForgotPassword}
      onOAuth={handleOAuth}
      onCloseForgotModal={closeForgotModal}
    />
  );
}

export { LoginContainer as Login };
