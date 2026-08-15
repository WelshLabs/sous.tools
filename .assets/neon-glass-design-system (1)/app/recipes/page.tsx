import type { Metadata } from "next"
import { AuroraBackground } from "@/components/aurora-background"
import { SiteHeader } from "@/components/site-header"
import { RecipesScreenContainer } from "@/components/recipes/recipes-screen.container"

export const metadata: Metadata = {
  title: "Recipes — sous.tools",
  description:
    "Browse, pin, and run your kitchen's recipes. Live POS menu items, daily pins, and favorites — all in one place.",
}

export default function RecipesPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <AuroraBackground fixed />
      <div className="relative z-10">
        <SiteHeader />
        <main>
          <RecipesScreenContainer />
        </main>
      </div>
    </div>
  )
}
