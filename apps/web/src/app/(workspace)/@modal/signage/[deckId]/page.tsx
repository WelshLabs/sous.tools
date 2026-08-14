/**
 * Empty slot for the @modal parallel route when on /signage/[deckId] (full editor).
 * The actual preview modal lives at @modal/signage/[deckId]/preview/page.tsx
 * and is only activated when navigating to /signage/[deckId]/preview.
 */
export default function DeckEditorModalSlot() {
  return null;
}
