import React, { useRef, useState, useEffect } from "react";
import {
  type SignageLayoutConfig,
  type PosItem,
  type SignageBlock,
  type SignageSlide,
} from "@soustools/api-types";
import { SignagePreviewView } from "./SignagePreview.view";

export interface SignagePreviewProps {
  config: SignageLayoutConfig;
  items: PosItem[];
  activeSlideIndex: number;
  isPreviewing?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string | null) => void;
  onAddBlock?: (parentId: string) => void;
  onUpdateBlock?: (blockId: string, updates: Partial<SignageBlock>) => void;
  onFetchModifierOptions?: (id: string) => Promise<any[]>;
  onSelectSlide?: (index: number) => void;
  onAddSlide?: () => void;
  onRemoveSlide?: (index: number) => void;
  onReorderSlides?: (slides: SignageSlide[]) => void;
  onUpdateSlide?: (index: number, updates: Partial<SignageSlide>) => void;
}

export const SignagePreview: React.FC<SignagePreviewProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [modifierCache, setModifierCache] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (
      props.config.aspectRatio === "responsive" ||
      props.config.scaleToFit === false
    )
      return;
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.max(0.1, (entry.contentRect.width - 64) / 1920));
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [props.config.aspectRatio, props.config.scaleToFit]);

  const fetchModifiers = async (groupId: string) => {
    if (modifierCache[groupId]) return modifierCache[groupId];
    if (props.onFetchModifierOptions) {
      const opts = await props.onFetchModifierOptions(groupId);
      setModifierCache((prev) => ({ ...prev, [groupId]: opts }));
      return opts;
    }
    return [];
  };

  return (
    <SignagePreviewView
      {...props}
      containerRef={containerRef}
      scale={scale}
      fetchModifiers={fetchModifiers}
    />
  );
};

export default SignagePreview;
