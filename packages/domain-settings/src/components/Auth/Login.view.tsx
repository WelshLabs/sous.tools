/* eslint-disable max-lines */
"use client";

import React from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";

export interface LoginViewProps {
  state: LoginState;
  showPw: boolean;
  setShowPw: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  error: string;
  forgotOpen: boolean;
  setForgotOpen: (val: boolean) => void;
  forgotEmail: string;
  setForgotEmail: (val: string) => void;
  forgotState: "idle" | "loading" | "success" | "error";
  forgotError: string;
  onLogin: (e: React.FormEvent) => void;
  onForgotPassword: (e: React.FormEvent) => void;
  onOAuth: (provider: "google" | "github") => void;
  onCloseForgotModal: () => void;
}

export function LoginView({
  state,
  showPw,
  setShowPw,
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  error,
  forgotOpen,
  setForgotOpen,
  forgotEmail,
  setForgotEmail,
  forgotState,
  forgotError,
  onLogin,
  onForgotPassword,
  onOAuth,
  onCloseForgotModal,
}: LoginViewProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6"
      >
        <AuroraBackground />

        <div className="glass-panel border-border relative z-[var(--z-overlay)] w-full max-w-md rounded-3xl border p-8 shadow-2xl">
          <div className="mb-8 flex flex-col items-center">
            <PrimaryLogo gradient className="mb-4 h-16 w-auto" />
            <h1 className="text-foreground text-center text-3xl font-extrabold tracking-tight">
              Sous Tools Login
            </h1>
          </div>

          {error && (
            <div className="bg-destructive/10 border-destructive/20 text-destructive animate-fadeIn mb-6 rounded-xl border p-4 text-center text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={onLogin} className="space-y-6">
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
                  className="text-muted-foreground hover:text-foreground inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors"
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
              <label className="text-muted-foreground inline-flex cursor-pointer items-center gap-2">
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
                className="text-primary cursor-pointer border-none bg-transparent p-0 transition-opacity hover:opacity-80"
              >
                Forgot password?
              </button>
            </div>

            <LoginButton state={state} />
          </form>

          <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs">
            <span className="bg-border h-px flex-1" />
            OR
            <span className="bg-border h-px flex-1" />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="glass"
              className="flex-1"
              onClick={() => onOAuth("google")}
            >
              <GoogleIcon className="h-[18px] w-[18px]" />
              Google
            </Button>
            <Button
              type="button"
              variant="glass"
              className="flex-1"
              onClick={() => onOAuth("github")}
            >
              <GitHubIcon className="h-[18px] w-[18px]" />
              GitHub
            </Button>
          </div>

          <p className="text-muted-foreground mt-6 text-center text-sm">
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

      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            key="forgot-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-background/60 fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-6 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) onCloseForgotModal();
            }}
          >
            <motion.div
              key="forgot-panel"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel border-border relative w-full max-w-sm rounded-2xl border p-8 shadow-2xl"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={onCloseForgotModal}
                className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-full p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {forgotState === "success" ? (
                <div className="py-4 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10">
                    <Mail className="h-6 w-6 text-sky-400" />
                  </div>
                  <h2 className="text-foreground mb-2 text-lg font-bold">
                    Check your inbox
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    If an account exists for{" "}
                    <span className="text-foreground font-medium">
                      {forgotEmail}
                    </span>
                    , you'll receive a password reset link shortly.
                  </p>
                  <Button
                    type="button"
                    variant="glass"
                    className="mt-6 w-full"
                    onClick={onCloseForgotModal}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={onForgotPassword} className="space-y-5">
                  <div>
                    <h2 className="text-foreground text-lg font-bold">
                      Reset your password
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Enter your email and we'll send you a reset link.
                    </p>
                  </div>

                  {forgotError && (
                    <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl border p-3 text-center text-sm font-medium">
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
