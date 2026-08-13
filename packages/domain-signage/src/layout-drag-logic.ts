import type { DropResult } from "@hello-pangea/dnd";
import type {
  SignageSlide,
  SignageBlock,
  SignageLayoutConfig,
} from "@soustools/api-types";
import {
  insertBlockAt,
  findBlockInTree,
  removeBlockFromTree,
} from "./block-tree-utils";

export function handleLayoutDragEnd(
  result: DropResult,
  config: SignageLayoutConfig,
  activeSlideIndex: number,
  updateSlide: (idx: number, updates: Partial<SignageSlide>) => void,
) {
  if (!result.destination) return;
  const { source, destination } = result;
  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  )
    return;

  const activeSlide = config.slides[activeSlideIndex];
  if (!activeSlide || activeSlide.type !== "COLUMN_LAYOUT") return;

  const newCols = activeSlide.columns.map((col) => {
    if (!col.blocks) return col;
    let newBlocks = [...col.blocks];

    if (source.droppableId === "sidebar-blocks") {
      const type = result.draggableId.replace("sidebar-add-", "");
      const newBlock: SignageBlock = type.endsWith("Block")
        ? ({
            id: `block-${Date.now()}`,
            type: type as any,
            blocks: [],
            cells: type === "GridBlock" ? [] : undefined,
          } as any)
        : ({ id: `block-${Date.now()}`, type: type as any } as any);
      newBlocks = newBlocks.map((root) =>
        insertBlockAt(
          root,
          destination.droppableId,
          destination.index,
          newBlock,
        ),
      );
      return { ...col, blocks: newBlocks };
    }

    let movedBlock: SignageBlock | undefined;
    for (const root of newBlocks) {
      const sourceParent = findBlockInTree(root, source.droppableId);
      if (sourceParent) {
        if (
          sourceParent.type === "ColumnBlock" ||
          sourceParent.type === "RowBlock" ||
          sourceParent.type === "ExplodedItemBlock"
        ) {
          movedBlock = sourceParent.blocks[source.index];
        } else if (sourceParent.type === "GridBlock") {
          movedBlock = sourceParent.cells[source.index];
        }
        if (movedBlock) break;
      }
    }

    if (!movedBlock || !movedBlock.id) return col;

    if (source.droppableId === destination.droppableId) {
      const reorderInTree = (b: SignageBlock): SignageBlock => {
        if (b.id === source.droppableId) {
          if (
            b.type === "ColumnBlock" ||
            b.type === "RowBlock" ||
            b.type === "ExplodedItemBlock"
          ) {
            const blks = [...b.blocks];
            const [removed] = blks.splice(source.index, 1);
            blks.splice(destination.index, 0, removed);
            return { ...b, blocks: blks };
          }
          if (b.type === "GridBlock") {
            const cells = [...b.cells];
            const [removed] = cells.splice(source.index, 1);
            cells.splice(destination.index, 0, removed);
            return { ...b, cells };
          }
        }
        if (
          b.type === "ColumnBlock" ||
          b.type === "RowBlock" ||
          b.type === "ExplodedItemBlock"
        ) {
          return {
            ...b,
            blocks: b.blocks.map((child) => reorderInTree(child)),
          };
        }
        if (b.type === "GridBlock") {
          return { ...b, cells: b.cells.map((child) => reorderInTree(child)) };
        }
        return b;
      };
      newBlocks = newBlocks.map((root) => reorderInTree(root));
    } else {
      newBlocks = newBlocks.map((root) =>
        removeBlockFromTree(root, movedBlock!.id!),
      );
      newBlocks = newBlocks.map((root) =>
        insertBlockAt(
          root,
          destination.droppableId,
          destination.index,
          movedBlock!,
        ),
      );
    }

    return { ...col, blocks: newBlocks };
  });

  updateSlide(activeSlideIndex, { columns: newCols });
}
