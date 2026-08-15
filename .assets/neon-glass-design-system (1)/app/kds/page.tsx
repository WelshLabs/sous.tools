import type { Metadata } from "next"
import { KdsScreenContainer } from "@/components/kds/kds-screen.container"

export const metadata: Metadata = { title: "KDS — sous.tools", description: "Live kitchen display system." }
export default function KdsPage(){return <KdsScreenContainer/>}
