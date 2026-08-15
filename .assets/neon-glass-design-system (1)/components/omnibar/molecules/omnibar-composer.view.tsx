"use client"

import type { FormEvent, KeyboardEvent } from "react"
import { ArrowUp, Mic, Paperclip, X } from "lucide-react"
import { motion } from "framer-motion"
import { AnimatedLettermark, Lettermark } from "@/components/logo"
import type { OmnibarFile } from "@/lib/omnibar/types"
import { OmnibarPerimeterView } from "../atoms/omnibar-perimeter.view"

interface Props { prompt: string; busy: boolean; home: boolean; pendingFiles: OmnibarFile[]; onPromptChange: (value: string) => void; onSubmit: () => void; onAttach: () => void; onVoice: () => void; onClose?: () => void }
const shellTransition = { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.9 }

export function OmnibarComposerView({ prompt, busy, home, pendingFiles, onPromptChange, onSubmit, onAttach, onVoice, onClose }: Props) {
  function submit(event: FormEvent) { event.preventDefault(); onSubmit() }
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) { if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) submit(event) }
  const canSend = prompt.trim().length > 0 || pendingFiles.length > 0
  return (
    <motion.form layoutId={home ? undefined : "omnibar-shell"} onSubmit={submit} transition={shellTransition} className="relative w-full max-w-3xl overflow-visible rounded-full border border-border/70 bg-card/95 p-2 shadow-[0_26px_80px_-30px_rgb(0_0_0/0.72)] backdrop-blur-2xl">
      <OmnibarPerimeterView busy={busy} />
      {pendingFiles.length > 0 && <div className="absolute bottom-[calc(100%+10px)] left-4 z-10 flex gap-2">{pendingFiles.map(file => <span key={file.id} className="rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">{file.name}</span>)}</div>}
      <div className="relative flex min-h-12 items-center gap-1 px-1">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center text-foreground">{busy ? <AnimatedLettermark className="h-7 w-7" duration={1.45} /> : <Lettermark gradient className="h-7 w-7" />}</span>
        <label className="sr-only" htmlFor="omnibar-prompt">Ask your sous chef</label>
        <input id="omnibar-prompt" autoFocus={!home} value={prompt} onChange={e => onPromptChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask your sous chef" className="min-w-0 flex-1 bg-transparent px-2 text-base text-foreground outline-none placeholder:text-muted-foreground" />
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={onVoice} aria-label="Start voice input" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Mic className="h-5 w-5" /></button>
          <button type="button" onClick={onAttach} aria-label="Attach files" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Paperclip className="h-5 w-5" /></button>
          {canSend && <motion.button initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} type="submit" disabled={busy} aria-label="Send message" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowUp className="h-5 w-5" /></motion.button>}
          {onClose && !home && <button type="button" onClick={onClose} aria-label="Close sous chef" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="h-4 w-4" /></button>}
        </div>
      </div>
    </motion.form>
  )
}
