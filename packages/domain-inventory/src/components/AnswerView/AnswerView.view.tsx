"use client";

import { Card, OmniTranscriptTimeline } from "@soustools/design-system";
import { type OmniMessage } from "@soustools/api-types";
import { FileText } from "lucide-react";
import { ArtifactColumnContainer } from "../ArtifactColumn/ArtifactColumn.container";

export interface AnswerViewViewProps {
  chatHistory: OmniMessage[];
  isProcessing: boolean;
  track2Type: string | null;
  realRevenueData: Array<{ name: string; value: number }>;
  realTicketTimeData: Array<{ time: string; minutes: number }>;
  prepListItems: Array<{ id: string; text: string; done: boolean }>;
  onTogglePrepItem: (id: string) => void;
}

export function AnswerViewView({
  chatHistory,
  isProcessing,
  track2Type,
  realRevenueData,
  realTicketTimeData,
  prepListItems,
  onTogglePrepItem,
}: AnswerViewViewProps) {
  // Derive the latest render_component directive (for artifact column)
  const renderDirectiveMessage =
    chatHistory.findLast((m) => (m.role as string) === "render_component") ??
    null;

  const hasArtifact = !!renderDirectiveMessage || !!track2Type;

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden">
      {/* ── Primary: Conversation Transcript Column ── */}
      <div
        className={`flex flex-1 flex-col overflow-y-auto px-4 pt-16 pb-32 ${
          hasArtifact ? "md:max-w-[58%]" : "mx-auto max-w-3xl"
        }`}
      >
        <Card className="border-border bg-card/80 w-full p-6 shadow-2xl backdrop-blur-xl">
          <OmniTranscriptTimeline
            messages={chatHistory}
            isProcessing={isProcessing}
            renderComponentDirective={(m) => {
              // render_component messages are surfaced in the artifact column;
              // show a subtle "Review ready →" placeholder in the transcript instead
              try {
                const directive = JSON.parse(m.content);
                if (directive.componentName === "INGESTION_REVIEW") {
                  return (
                    <div className="border-border bg-card/90 flex items-center justify-between rounded-xl border p-3.5 shadow-md backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <div className="border-primary/30 bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg border">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-foreground text-xs font-semibold">
                            Polymorphic Ingestion Review
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            Canvas active in the secondary column
                          </p>
                        </div>
                      </div>
                      <span className="bg-primary/10 text-primary border-primary/20 rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium">
                        Active
                      </span>
                    </div>
                  );
                }
              } catch {
                // no-op
              }
              return null;
            }}
          />
        </Card>
      </div>

      {/* ── Secondary: Artifact Column (desktop side panel / mobile bottom sheet) ── */}
      {hasArtifact && (
        <ArtifactColumnContainer
          renderDirectiveMessage={renderDirectiveMessage}
          track2Type={track2Type}
          realRevenueData={realRevenueData}
          realTicketTimeData={realTicketTimeData}
          prepListItems={prepListItems}
          onTogglePrepItem={onTogglePrepItem}
        />
      )}
    </div>
  );
}
