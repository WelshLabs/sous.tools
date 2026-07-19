"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { type SignageDisplay } from "@soustools/api-types";
import { 
  DisplayManagerView, 
  DisplayPickerView, 
  DisplayCardView, 
  DeckCardView 
} from "./DisplayManager.view";

export interface DisplayManagerProps {
  displays: SignageDisplay[];
  layouts: any[];
  onAddBrowserDisplay: (name: string) => Promise<void>;
  onDeleteDisplay: (id: string) => Promise<void>;
  onAssignDeck: (displayId: string, deckId: string | null) => Promise<void>;
  onRefreshData?: () => void;
  onPairDisplay?: (code: string) => Promise<void>;
  onSaveDevice?: (deviceId: string, payload: any) => Promise<void>;
  onFetchDevice?: (deviceId: string) => Promise<any>;
}

export const DisplayManager: React.FC<DisplayManagerProps> = ({
  displays,
  layouts,
  onAddBrowserDisplay,
  onDeleteDisplay,
  onAssignDeck,
  onRefreshData,
  onPairDisplay,
  onSaveDevice,
  onFetchDevice,
}) => {
  const [showPairModal, setShowPairModal] = useState<boolean>(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const handleAddBrowserDisplay = async () => {
    const name = prompt("Enter standalone browser display name:", "Browser View");
    if (!name) return;
    await onAddBrowserDisplay(name);
  };

  const handleDeleteDisplay = async (id: string) => {
    if (!confirm("Remove this display terminal?")) return;
    await onDeleteDisplay(id);
  };

  return (
    <DisplayManagerView
      displays={displays}
      layouts={layouts}
      onRefreshData={onRefreshData}
      handleAddBrowserDisplay={handleAddBrowserDisplay}
      setShowPairModal={setShowPairModal}
      showPairModal={showPairModal}
      onPairDisplay={onPairDisplay}
      selectedDeviceId={selectedDeviceId}
      setSelectedDeviceId={setSelectedDeviceId}
      onSaveDevice={onSaveDevice}
      onFetchDevice={onFetchDevice}
      onAssignDeck={onAssignDeck}
      handleDeleteDisplay={handleDeleteDisplay}
    />
  );
};

export interface DisplayPickerProps {
  deckId?: string;
  displays: SignageDisplay[];
  onToggleDisplay: (displayId: string, isAssigned: boolean) => Promise<void>;
}

export const DisplayPicker: React.FC<DisplayPickerProps> = (props) => {
  return <DisplayPickerView {...props} />;
};

export interface DisplayCardProps {
  display: SignageDisplay;
  decks: { id: string; name: string }[];
  isOnline: boolean;
  onDeckAssign: (displayId: string, deckId: string | null) => void;
  onDelete: (id: string) => void;
  onDeviceSettingsClick?: (deviceId: string) => void;
}

export const DisplayCard: React.FC<DisplayCardProps> = (props) => {
  return <DisplayCardView {...props} />;
};

export interface DeckCardProps {
  deck: any;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string, slug: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck, onDelete, onRename }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(deck.name);
  const [slug, setSlug] = useState(deck.slug);
  const [copied, setCopied] = useState(false);

  const handleSaveRename = () => {
    setIsEditing(false);
    if (name.trim() !== deck.name || slug.trim() !== deck.slug) {
      onRename(deck.id, name.trim(), slug.trim());
    }
  };

  const getLiveUrl = (s: string) => {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return `http://localhost:5003/s/dtown-cafe/${s}`;
    }
    return `${typeof window !== "undefined" ? window.location.origin : ""}/s/dtown-cafe/${s}`;
  };

  const handleCopyUrl = async () => {
    const url = getLiveUrl(deck.slug);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slideCount = deck.config?.slides?.length || 0;

  const onEditClick = () => {
    router.push(`/signage/${deck.id}`);
  };

  return (
    <DeckCardView
      deck={deck}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      name={name}
      setName={setName}
      slug={slug}
      setSlug={setSlug}
      handleSaveRename={handleSaveRename}
      copied={copied}
      handleCopyUrl={handleCopyUrl}
      onDelete={onDelete}
      getLiveUrl={getLiveUrl}
      slideCount={slideCount}
      onEditClick={onEditClick}
    />
  );
};
