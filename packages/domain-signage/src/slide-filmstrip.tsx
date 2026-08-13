"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import type {
  SignageSlide,
  PosItem,
  SignageLayoutConfig,
} from "@soustools/api-types";
import { GripVertical, Plus } from "lucide-react";
import { SlideCard } from "./slide-filmstrip-card";

export interface SlideFilmstripProps {
  slides: SignageSlide[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onRemoveSlide: (index: number) => void;
  onReorderSlides: (slides: SignageSlide[]) => void;
  items: PosItem[];
  config: SignageLayoutConfig;
}

/**
 * Horizontal scrollable filmstrip showing a live-miniature thumbnail per slide.
 * Supports drag-to-reorder via @hello-pangea/dnd and hover-to-delete.
 *
 * @tenant-docs-export
 * The filmstrip at the bottom of the editor shows all slides in your playlist.
 * Drag slides to reorder. Hover a slide to reveal the trash icon. Click the
 * dashed "+ Add Slide" card at the end to create a new slide.
 */
export const SlideFilmstrip: React.FC<SlideFilmstripProps> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onRemoveSlide,
  onReorderSlides,
}) => {
  const onDragEnd = (result: DropResult): void => {
    if (!result.destination) return;
    const list = Array.from(slides);
    const [moved] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, moved);
    onReorderSlides(list);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="filmstrip-slides" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-row gap-3 overflow-x-auto p-3 bg-card border-t border-border"
          >
            {slides.map((slide, index) => {
              const slideId = slide.id || `slide-fallback-${index}`;
              return (
                <Draggable key={slideId} draggableId={slideId} index={index}>
                  {(drag) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className="flex items-center gap-1 flex-shrink-0"
                    >
                      <div
                        {...drag.dragHandleProps}
                        className="text-foreground/30 hover:text-foreground/70 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <SlideCard
                        slide={slide}
                        isActive={index === activeSlideIndex}
                        onSelect={() => onSelectSlide(index)}
                        onRemove={(e) => {
                          e.stopPropagation();
                          onRemoveSlide(index);
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}

            {/* Add Slide card */}
            <button
              onClick={onAddSlide}
              className="w-40 h-[90px] flex-shrink-0 flex flex-col items-center justify-center gap-1
                         rounded-lg border-2 border-dashed border-white/20 text-foreground/40
                         hover:border-primary/60 hover:text-primary/80 transition-colors cursor-pointer"
              aria-label="Add slide"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs font-medium">Add Slide</span>
            </button>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
