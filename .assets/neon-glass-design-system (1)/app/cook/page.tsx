import type { Metadata } from "next"
import { CookScreenContainer } from "@/components/cook/cook-screen.container"
export const metadata:Metadata={title:"Live Cook Mode — sous.tools",description:"Hands-on, full-screen recipe execution."}
export default function CookPage(){return <CookScreenContainer/>}
