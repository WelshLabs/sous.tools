import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { PDFParse } from "pdf-parse";
import { serverConfig as config } from "@soustools/config/server";
import { supabase } from "../../lib/supabase";
import { chunkText } from "./knowledge-chunker.util";

export interface KnowledgeIngestionJobData {
  organizationId?: string;
  userId?: string;
  sourceDocumentUrl?: string;
  fileBufferBase64?: string;
  fileName?: string;
  sourceName?: string;
  isGlobal?: boolean;
  documentType?: string;
  prompt?: string;
  rawText?: string;
}

@Processor("knowledge-ingestion")
export class KnowledgeIngestionProcessor extends WorkerHost {
  private readonly logger = new Logger(KnowledgeIngestionProcessor.name);

  async process(
    job: Job<KnowledgeIngestionJobData, any, string>,
  ): Promise<any> {
    this.logger.log(`Starting knowledge ingestion job ${job.id}`);
    const {
      organizationId,
      sourceDocumentUrl,
      fileBufferBase64,
      fileName,
      sourceName,
      isGlobal: isGlobalPayload,
      documentType = "pdf",
      prompt,
    } = job.data;

    let rawText = job.data.rawText || "";

    if (!rawText) {
      const buffer = fileBufferBase64
        ? Buffer.from(fileBufferBase64, "base64")
        : sourceDocumentUrl
          ? await this.downloadFileFromStorage(sourceDocumentUrl)
          : null;

      if (buffer) {
        try {
          rawText = await this.extractPdfText(buffer);
          this.logger.log(
            `Extracted ${rawText.length} characters from PDF buffer`,
          );
        } catch (pdfErr: any) {
          this.logger.error(
            `PDF parsing failed: ${pdfErr.message}`,
            pdfErr.stack,
          );
          throw new Error(`Failed to parse PDF: ${pdfErr.message}`);
        }
      }
    }

    if (!rawText || rawText.trim().length === 0) {
      this.logger.warn(`No extractable text found for job ${job.id}`);
      return { success: false, reason: "No text content found" };
    }

    const chunks = chunkText(rawText, 1500, 200);
    this.logger.log(`Split text into ${chunks.length} chunks`);

    const effectiveFileName =
      fileName || sourceName || "knowledge_document.pdf";
    const isGlobal =
      isGlobalPayload ??
      (prompt ? prompt.toLowerCase().includes("global") : false);

    let insertedCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.generateOllamaEmbedding(chunk);

      const { error } = await supabase.from("core_knowledge_vectors").insert({
        organization_id: isGlobal ? null : organizationId || null,
        content: chunk,
        embedding: JSON.stringify(embedding),
        source_meta: {
          fileName: effectiveFileName,
          chunkIndex: i,
          totalChunks: chunks.length,
          sourceDocumentUrl: sourceDocumentUrl || null,
          prompt: prompt || null,
        },
        is_global: isGlobal,
        document_type: documentType,
      });

      if (error) {
        this.logger.error(
          `Failed to insert chunk ${i + 1}/${chunks.length} into core_knowledge_vectors: ${error.message}`,
        );
        throw new Error(`DB insert failed for chunk ${i}: ${error.message}`);
      }

      insertedCount++;
    }

    this.logger.log(
      `Successfully ingested ${insertedCount}/${chunks.length} chunks into core_knowledge_vectors`,
    );

    return {
      success: true,
      chunksProcessed: insertedCount,
      isGlobal,
      fileName: effectiveFileName,
    };
  }

  private async generateOllamaEmbedding(chunkText: string): Promise<number[]> {
    const ollamaUrl = `${config.OLLAMA_HOST || "http://127.0.0.1:11434"}/api/embeddings`;
    const model = "nomic-embed-text";

    try {
      const response = await fetch(ollamaUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: chunkText }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        throw new Error(
          `Ollama API returned HTTP ${response.status}: ${errBody || response.statusText}`,
        );
      }

      const data = (await response.json()) as { embedding?: number[] };
      if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error(
          `Invalid response format from Ollama embeddings endpoint`,
        );
      }

      return data.embedding;
    } catch (err: any) {
      this.logger.error(
        `Ollama embedding generation failed for model ${model}: ${err.message}`,
      );
      throw err;
    }
  }

  private async downloadFileFromStorage(
    urlOrPath: string,
  ): Promise<Buffer | null> {
    try {
      const filePath = urlOrPath.includes("/ingestion-sources/")
        ? urlOrPath.split("/ingestion-sources/")[1]
        : urlOrPath.split("/").pop() || "";

      if (!filePath) return null;

      const { data, error } = await supabase.storage
        .from("ingestion-sources")
        .download(filePath);

      if (error || !data) return null;

      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err: any) {
      this.logger.error(
        `Failed to download PDF buffer from storage (${urlOrPath}): ${err.message}`,
      );
      return null;
    }
  }

  private async extractPdfText(buffer: Buffer): Promise<string> {
    if (typeof PDFParse === "function") {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text || "";
    }
    return "";
  }
}
