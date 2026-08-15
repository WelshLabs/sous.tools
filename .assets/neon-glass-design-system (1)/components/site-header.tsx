import Link from "next/link"
import { PrimaryLogo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-[1680px] items-center px-5">
        <div className="ds-glass flex h-12 w-full items-center justify-between rounded-full pl-5 pr-2.5">
          <Link href="/" aria-label="sous.tools home" className="flex items-center">
            <PrimaryLogo className="h-7 w-auto text-foreground" />
          </Link>
          <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
            <Link href="/showcase" className="rounded-full px-3 py-1.5 transition-colors hover:text-foreground">Showcase</Link>
            <Link href="/recipes" className="rounded-full px-3 py-1.5 transition-colors hover:text-foreground">Recipes</Link>
            <Link href="/pos" className="rounded-full px-3 py-1.5 transition-colors hover:text-foreground">POS</Link>
            <Link href="/kds" className="rounded-full px-3 py-1.5 transition-colors hover:text-foreground">KDS</Link>
            <Link href="/cook" className="rounded-full px-3 py-1.5 transition-colors hover:text-foreground">Cook mode</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button size="sm" variant="gradient">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
