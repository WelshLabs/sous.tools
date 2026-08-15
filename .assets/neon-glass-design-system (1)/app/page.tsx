import { AuroraBackground } from "@/components/aurora-background"
import { PrimaryLogo } from "@/components/logo"

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <AuroraBackground />
      <div className="relative z-10 flex w-full max-w-4xl -translate-y-24 flex-col items-center gap-6 text-center sm:-translate-y-20">
        <PrimaryLogo gradient className="h-14 w-auto" />
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Your <span className="ds-text-neon">sous chef</span> for every shift
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          Ask questions, upload invoices and recipes, review metrics, and control your restaurant—all from one conversation.
        </p>
      </div>
    </main>
  )
}
