import type { OmnibarEvent } from "@/lib/omnibar/types"
import { MessageEventView } from "../molecules/message-event.view"
import { ActivityEventView } from "../molecules/activity-event.view"
import { MetricsEventView } from "../molecules/metrics-event.view"
import { UploadsEventView } from "../molecules/uploads-event.view"
import { OperationEventView } from "../molecules/operation-event.view"

export function OmnibarEventView({ event, onApply }: { event: OmnibarEvent; onApply: (id: string) => void }) {
  if (event.type === "user" || event.type === "agent") return <MessageEventView event={event} />
  if (event.type === "activity") return <ActivityEventView event={event} />
  if (event.type === "metrics") return <MetricsEventView event={event} />
  if (event.type === "uploads") return <UploadsEventView event={event} />
  return <OperationEventView event={event} onApply={onApply} />
}
