import type { Metadata } from "next"
import { PosScreenContainer } from "@/components/pos/pos-screen.container"

export const metadata: Metadata = { title: "POS — sous.tools", description: "Fast, connected restaurant point of sale." }

export default function PosPage() {
  return <PosScreenContainer />
}
