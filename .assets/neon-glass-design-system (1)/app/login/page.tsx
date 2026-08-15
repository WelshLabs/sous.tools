import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AuroraBackground } from "@/components/aurora-background"
import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "Sign in — sous.tools",
  description: "Neon-glass login screen built on the sous.tools design system.",
}

export default function LoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-10">
      <AuroraBackground fixed />
      <div className="relative z-10 flex w-full max-w-md flex-col gap-5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to system
          </Link>
          <ThemeToggle />
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
