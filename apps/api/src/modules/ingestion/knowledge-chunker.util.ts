/**
 * Splits text into manageable paragraph-aware chunks with overlap.
 */
export function chunkText(
  text: string,
  maxChunkSize: number = 1500,
  overlapSize: number = 200,
): string[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const paragraphs = normalized.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const trimmedPara = paragraph.trim();
    if (!trimmedPara) continue;

    if (trimmedPara.length > maxChunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      const subChunks = splitLongParagraph(
        trimmedPara,
        maxChunkSize,
        overlapSize,
      );
      chunks.push(...subChunks);
    } else if (currentChunk.length + trimmedPara.length + 2 > maxChunkSize) {
      chunks.push(currentChunk.trim());
      const overlap = currentChunk.slice(-overlapSize);
      currentChunk = overlap ? `${overlap}\n\n${trimmedPara}` : trimmedPara;
    } else {
      currentChunk = currentChunk
        ? `${currentChunk}\n\n${trimmedPara}`
        : trimmedPara;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [normalized.trim()];
}

function splitLongParagraph(
  para: string,
  maxChunkSize: number,
  overlapSize: number,
): string[] {
  const subChunks: string[] = [];
  let start = 0;
  while (start < para.length) {
    let end = start + maxChunkSize;
    if (end >= para.length) {
      subChunks.push(para.slice(start).trim());
      break;
    }
    const lastSpace = para.lastIndexOf(" ", end);
    if (lastSpace > start + maxChunkSize / 2) {
      end = lastSpace;
    }
    subChunks.push(para.slice(start, end).trim());
    start = end - overlapSize;
  }
  return subChunks;
}
