export type OmnibarFileKind = "image" | "pdf" | "spreadsheet"

export interface OmnibarFile {
  id: string
  name: string
  size: string
  kind: OmnibarFileKind
  preview?: string
}

export type OmnibarEvent =
  | { id: string; type: "user"; text: string; createdAt: string }
  | { id: string; type: "agent"; text: string; createdAt: string }
  | { id: string; type: "activity"; title: string; detail: string; status: "working" | "complete" }
  | { id: string; type: "uploads"; files: OmnibarFile[] }
  | { id: string; type: "metrics"; title: string; metrics: Array<{ label: string; value: string; change?: string }> }
  | { id: string; type: "change"; title: string; detail: string; status: "ready" | "applied" }
  | { id: string; type: "ingestion"; title: string; detail: string; items: Array<{ label: string; value: string }> }

export interface OmnibarViewState {
  open: boolean
  home: boolean
  prompt: string
  busy: boolean
  events: OmnibarEvent[]
  pendingFiles: OmnibarFile[]
}

export interface OmnibarViewActions {
  openOmnibar: () => void
  closeOmnibar: () => void
  setPrompt: (value: string) => void
  submitPrompt: () => void
  attachDemoFiles: () => void
  toggleVoice: () => void
  applyChange: (eventId: string) => void
  clearConversation: () => void
}
