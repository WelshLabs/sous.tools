"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clientConfig } from "@soustools/config/client";
import { createApiClient } from "@soustools/api-client";
import { ResetPasswordView } from "./ResetPassword.view";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = createApiClient({ baseUrl: clientConfig.NEXT_PUBLIC_API_URL });

  const [code, setCode] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
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
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setStatus("error");
    }
  };

  return (
    <ResetPasswordView
      status={status}
      errorMessage={errorMessage}
      password={password}
      setPassword={setPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      showConfirm={showConfirm}
      setShowConfirm={setShowConfirm}
      onSubmit={handleSubmit}
    />
  );
}

export function ResetPasswordContainer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}

export { ResetPasswordContainer as ResetPassword };
