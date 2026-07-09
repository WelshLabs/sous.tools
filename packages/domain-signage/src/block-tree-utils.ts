import { type SignageBlock } from "@soustools/api-types";

export function findBlockInTree(block: SignageBlock, id: string): SignageBlock | null {
  if (block.id === id) return block;
  if (block.type === "ColumnBlock" || block.type === "RowBlock" || block.type === "ExplodedItemBlock") {
    for (const sub of block.blocks) {
      const found = findBlockInTree(sub, id);
      if (found) return found;
    }
  } else if (block.type === "GridBlock") {
    for (const sub of block.cells) {
      const found = findBlockInTree(sub, id);
      if (found) return found;
    }
  }
  return null;
}

export function updateBlockInTree(block: SignageBlock, id: string, updates: Partial<SignageBlock>): SignageBlock {
  if (block.id === id) {
    const updated = { ...block, ...updates } as SignageBlock;
    if (updated.type === "GridBlock") {
      const rows = updated.rows ?? 1;
      const columns = updated.columns ?? 1;
      const totalCells = rows * columns;
      let cells = updated.cells ? [...updated.cells] : [];
      while (cells.length < totalCells) {
        cells.push({
          id: `block-grid-cell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "ColumnBlock",
          blocks: []
        });
      }
      if (cells.length > totalCells) {
        cells = cells.slice(0, totalCells);
      }
      updated.cells = cells;
    }
    return updated;
  }
  if (block.type === "ColumnBlock" || block.type === "RowBlock" || block.type === "ExplodedItemBlock") {
    return {
      ...block,
      blocks: block.blocks.map((b) => updateBlockInTree(b, id, updates)),
    };
  }
  if (block.type === "GridBlock") {
    return {
      ...block,
      cells: block.cells.map((b) => updateBlockInTree(b, id, updates)),
    };
  }
  return block;
}

export function insertBlockIntoTree(block: SignageBlock, parentId: string, newBlock: SignageBlock): SignageBlock {
  if (block.id === parentId) {
    if (block.type === "ColumnBlock" || block.type === "RowBlock" || block.type === "ExplodedItemBlock") {
      return {
        ...block,
        blocks: [...block.blocks, newBlock],
      };
    }
    if (block.type === "GridBlock") {
      return {
        ...block,
        cells: [...block.cells, newBlock],
      };
    }
  }
  if (block.type === "ColumnBlock" || block.type === "RowBlock" || block.type === "ExplodedItemBlock") {
    return {
      ...block,
      blocks: block.blocks.map((b) => insertBlockIntoTree(b, parentId, newBlock)),
    };
  }
  if (block.type === "GridBlock") {
    return {
      ...block,
      cells: block.cells.map((b) => insertBlockIntoTree(b, parentId, newBlock)),
    };
  }
  return block;
}

export function removeBlockFromTree(block: SignageBlock, idToRemove: string): SignageBlock {
  if (block.type === "ColumnBlock" || block.type === "RowBlock" || block.type === "ExplodedItemBlock") {
    return {
      ...block,
      blocks: block.blocks.filter(b => b.id !== idToRemove).map(b => removeBlockFromTree(b, idToRemove))
    };
  }
  if (block.type === "GridBlock") {
    return {
      ...block,
      cells: block.cells.filter(b => b.id !== idToRemove).map(b => removeBlockFromTree(b, idToRemove))
    };
  }
  return block;
}

export function insertBlockAt(block: SignageBlock, parentId: string, index: number, newBlock: SignageBlock): SignageBlock {
  if (block.id === parentId) {
    if (block.type === "ColumnBlock" || block.type === "RowBlock" || block.type === "ExplodedItemBlock") {
      const newBlocks = [...block.blocks];
      newBlocks.splice(index, 0, newBlock);
      return { ...block, blocks: newBlocks };
    }
    if (block.type === "GridBlock") {
      const newCells = [...block.cells];
      newCells.splice(index, 0, newBlock);
      return { ...block, cells: newCells };
    }
  }
  if (block.type === "ColumnBlock" || block.type === "RowBlock" || block.type === "ExplodedItemBlock") {
    return {
      ...block,
      blocks: block.blocks.map(b => insertBlockAt(b, parentId, index, newBlock))
    };
  }
  if (block.type === "GridBlock") {
    return {
      ...block,
      cells: block.cells.map(b => insertBlockAt(b, parentId, index, newBlock))
    };
  }
  return block;
}
