"use client";

import React from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { SignageSlide, SlideType } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { Plus } from "lucide-react";
import { PlaylistSlideItem } from "./playlist-slide-item";

/**
 * Props for the PlaylistTab component.
 */
export interface PlaylistTabProps {
  /** Array of active signage slides. */
  slides: SignageSlide[];
  /** Callback triggered when the slides list updates. */
  onChange: (slides: SignageSlide[]) => void;
}

/**
 * PlaylistTab component provides a drag-and-drop playlist builder for signage.
 *
 * @tenant-docs-export
 * Use the playlist tab to manage slides shown on screens. You can add new Menu boards, Images, Videos,
 * or Custom web URLs. Drag and drop slides to change the playback order.
 */
export const PlaylistTab: React.FC<PlaylistTabProps> = ({
  slides,
  onChange,
}) => {
  const onDragEnd = (result: DropResult): void => {
    if (!result.destination) return;
    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onChange(items);
  };

  const addSlide = (type: SlideType): void => {
    const base = { id: `slide-${Date.now()}`, type, durationSeconds: 10 };
    let newSlide: SignageSlide;
    if (type === "MENU") {
      newSlide = {
        ...base,
        type: "MENU",
        layoutTemplate: "GRID",
        highlightItems: [],
      };
    } else if (type === "IMAGE") {
      newSlide = { ...base, type: "IMAGE", imageUrl: "", fit: "cover" };
    } else if (type === "VIDEO") {
      newSlide = {
        ...base,
        type: "VIDEO",
        videoUrl: "",
        loop: true,
        mute: true,
      };
    } else {
      newSlide = { ...base, type: "IFRAME", url: "" };
    }
    onChange([...slides, newSlide]);
  };

  const updateSlide = (id: string, updates: Partial<SignageSlide>): void => {
    onChange(
      slides.map((s) => {
        if (s.id !== id) return s;
        return { ...s, ...updates } as SignageSlide;
      }),
    );
  };

  const removeSlide = (id: string): void => {
    onChange(slides.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(["MENU", "IMAGE", "VIDEO", "IFRAME"] as SlideType[]).map((type) => (
          <Button
            key={type}
            size="sm"
            onClick={() => addSlide(type)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-1 inline" /> {type}
          </Button>
        ))}
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="playlist-slides">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {slides.map((slide, index) => (
                <PlaylistSlideItem
                  key={slide.id}
                  slide={slide}
                  index={index}
                  onUpdate={(updates) => updateSlide(slide.id, updates)}
                  onRemove={() => removeSlide(slide.id)}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
