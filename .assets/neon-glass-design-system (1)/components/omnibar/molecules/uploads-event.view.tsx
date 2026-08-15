import { FileImage, FileSpreadsheet, FileText } from "lucide-react"
import type { OmnibarEvent } from "@/lib/omnibar/types"
import { EventIconView } from "../atoms/event-icon.view"

type Uploads = Extract<OmnibarEvent, { type: "uploads" }>
export function UploadsEventView({ event }: { event: Uploads }) {
  return <article className="flex gap-3"><EventIconView type="uploads" /><div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">{event.files.map(file => { const Icon = file.kind === "image" ? FileImage : file.kind === "spreadsheet" ? FileSpreadsheet : FileText; return <div key={file.id} className="flex min-w-48 items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card/82 p-3 shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-muted text-primary"><Icon className="h-5 w-5" /></span><span className="min-w-0"><span className="block truncate text-sm font-medium text-foreground">{file.name}</span><span className="text-xs text-muted-foreground">{file.size}</span></span></div>})}</div></article>
}
