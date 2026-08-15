"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { OmnibarView } from "./omnibar.view"
import { OMNIBAR_DEMO_EVENTS } from "@/lib/omnibar/mock-data"
import type { OmnibarEvent, OmnibarFile, OmnibarViewActions } from "@/lib/omnibar/types"

const DEMO_FILES: OmnibarFile[] = [
  { id: "invoice-1", name: "vendor-invoice-1048.pdf", size: "1.8 MB", kind: "pdf" },
  { id: "recipe-1", name: "spring-menu.jpg", size: "3.2 MB", kind: "image" },
]

function now() {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date())
}

export function OmnibarContainer() {
  const pathname = usePathname()
  const home = pathname === "/"
  const [open, setOpen] = React.useState(false)
  const [prompt, setPrompt] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [events, setEvents] = React.useState<OmnibarEvent[]>([])
  const [pendingFiles, setPendingFiles] = React.useState<OmnibarFile[]>([])
  const timers = React.useRef<Array<ReturnType<typeof setTimeout>>>([])

  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])
  React.useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [open])

  const submitPrompt = React.useCallback(() => {
    const text = prompt.trim() || (pendingFiles.length ? "Ingest these files and tell me what changed." : "")
    if (!text || busy) return
    const id = Date.now().toString()
    const uploads = pendingFiles.length ? [{ id: `${id}-files`, type: "uploads" as const, files: pendingFiles }] : []
    setEvents(previous => [...previous, ...uploads, { id: `${id}-user`, type: "user", text, createdAt: now() }, { id: `${id}-work`, type: "activity", title: pendingFiles.length ? "Reading and classifying files" : "Working across your restaurant data", detail: "Checking the relevant records, linked services, and recent operating context.", status: "working" }])
    setPrompt("")
    setPendingFiles([])
    setBusy(true)

    timers.current.push(setTimeout(() => {
      setEvents(previous => previous.map(event => event.id === `${id}-work` && event.type === "activity" ? { ...event, status: "complete", detail: "Reviewed POS, recipe, inventory, and operating records." } : event))
    }, 800))
    timers.current.push(setTimeout(() => {
      const result: OmnibarEvent[] = pendingFiles.length
        ? [
            { id: `${id}-ingest`, type: "ingestion", title: "Files are ready to import", detail: "I matched the invoice and recipe image to existing vendors, units, and ingredient records.", items: [{ label: "line items", value: "18" }, { label: "new recipe", value: "1" }, { label: "needs review", value: "2" }] },
            { id: `${id}-reply`, type: "agent", text: "Everything is parsed. I flagged two invoice units that differ from your inventory setup so you can review them before applying changes.", createdAt: now() },
          ]
        : [
            ...OMNIBAR_DEMO_EVENTS.filter(event => event.type === "metrics"),
            { id: `${id}-change`, type: "change" as const, title: "Suggested menu adjustment", detail: "Move the mushroom entrée into tonight’s featured position. It is outperforming category average by 14%.", status: "ready" as const },
            { id: `${id}-reply`, type: "agent" as const, text: "Dinner is trending ahead of last Friday. Sales are up 8.4%, and the mushroom entrée is the strongest contributor. I prepared one optional menu change for review.", createdAt: now() },
          ]
      setEvents(previous => [...previous, ...result])
      setBusy(false)
    }, 1500))
  }, [busy, pendingFiles, prompt])

  const actions = React.useMemo<OmnibarViewActions>(() => ({
    openOmnibar: () => setOpen(true),
    closeOmnibar: () => setOpen(false),
    setPrompt,
    submitPrompt,
    attachDemoFiles: () => setPendingFiles(DEMO_FILES),
    toggleVoice: () => setPrompt(previous => previous || "How did dinner service perform?"),
    applyChange: eventId => setEvents(previous => previous.map(event => event.id === eventId && event.type === "change" ? { ...event, status: "applied" } : event)),
    clearConversation: () => setEvents([]),
  }), [submitPrompt])

  return <OmnibarView state={{ open, home, prompt, busy, events, pendingFiles }} actions={actions} />
}
