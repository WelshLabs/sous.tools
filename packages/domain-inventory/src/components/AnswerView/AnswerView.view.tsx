/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Card,
  OmniTranscriptTimeline,
} from "@soustools/design-system";
import { type OmniMessage } from "@soustools/api-types";
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
    chatHistory.findLast(
      (m) => m.role === ("render_component" as any),
    ) ?? null;

  const hasArtifact = !!renderDirectiveMessage || !!track2Type;

  return (
    <div className="flex min-h-screen w-full flex-1 overflow-hidden">
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
                    <div className="border-border bg-muted/40 rounded-xl border px-4 py-3 text-sm text-zinc-400 italic">
                      📋 Ingestion review ready — see panel →
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
