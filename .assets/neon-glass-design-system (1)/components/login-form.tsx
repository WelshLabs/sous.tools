"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { PrimaryLogo } from "@/components/logo"
import { GoogleIcon, GitHubIcon } from "@/components/brand-icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoginButton, type LoginState } from "@/components/login-button"

export function LoginForm() {
  const [state, setState] = React.useState<LoginState>("idle")
  const [showPw, setShowPw] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === "loading") return
    setState("loading")
    // Demo state machine: valid-looking email + 6+ char password "succeeds".
    window.setTimeout(() => {
      const ok = /\S+@\S+\.\S+/.test(email) && password.length >= 6
      setState(ok ? "success" : "error")
      if (!ok) window.setTimeout(() => setState("idle"), 1600)
    }, 1400)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="ds-glass-strong w-full max-w-md rounded-[var(--radius-xl)] p-8"
    >
      <div className="mb-7 flex flex-col items-center gap-5 text-center">
        <PrimaryLogo gradient className="h-11 w-auto" />
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to get back to your kitchen</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="accent-[color:var(--primary)]" />
            Remember me
          </label>
          <a href="#" className="text-primary transition-opacity hover:opacity-80">
            Forgot password?
          </a>
        </div>

        <LoginButton state={state} />
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="glass" className="flex-1">
          <GoogleIcon className="h-[18px] w-[18px]" />
          Google
        </Button>
        <Button type="button" variant="glass" className="flex-1">
          <GitHubIcon className="h-[18px] w-[18px]" />
          GitHub
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <a href="#" className="text-primary transition-opacity hover:opacity-80">
          Create an account
        </a>
      </p>
    </motion.div>
  )
}
