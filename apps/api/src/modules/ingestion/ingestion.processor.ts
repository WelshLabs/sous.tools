import { Processor, WorkerHost } from "@nestjs/bullmq";
import { type Job } from "bullmq";
import { type IngestionPayload } from "@soustools/api-types";
import { type GoogleDriveService } from "../integrations/google-drive.service";
import { supabase } from "../../lib/supabase";
import { Inject } from "@nestjs/common";
import { type IVisionService } from "./IVisionService";
import { type IngestionGateway } from "./ingestion.gateway";

@Processor("ingestion")
export class IngestionProcessor extends WorkerHost {
  constructor(
    private readonly driveService: GoogleDriveService,
    @Inject("IVisionService") private readonly visionService: IVisionService,
    private readonly gateway: IngestionGateway
  ) {
    super();
  }

  async process(job: Job<IngestionPayload, any, string>): Promise<any> {
    const { source, organizationId, userId, fileIds, documentType } = job.data;
    
    let rawText = "";
    let sourceDocumentUrl = "";
    let actualSourceDocumentUrl = "";
    let sourceName = null;

    this.gateway.emitJobStateChange(organizationId, "processing_started", { jobId: job.id });

    try {
      if (source === "google_drive" && fileIds && fileIds.length > 0) {
        for (const fileId of fileIds) {
          const { text, sourceDocumentUrl: driveDocUrl, sourceName: driveSourceName } = await this.driveService.processDriveFile(fileId, organizationId, job.data.reviewId || "new");
          if (text) rawText += text + "\n";
          if (driveDocUrl && !sourceDocumentUrl) {
            sourceDocumentUrl = driveDocUrl;
          }
          if (driveSourceName && !sourceName) {
            sourceName = driveSourceName;
          }
        }
      }

      let parsedData: any = {};
      actualSourceDocumentUrl = job.data.sourceDocumentUrl || sourceDocumentUrl;
      let buffer: Buffer | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (actualSourceDocumentUrl) {
        let filePath = "";
        try {
          filePath = actualSourceDocumentUrl.includes('/ingestion-sources/')
            ? actualSourceDocumentUrl.split('/ingestion-sources/')[1]
            : (actualSourceDocumentUrl.split('/').pop() || "");

          if (filePath) {
            const { data: fileData, error: downloadErr } = await supabase.storage
              .from("ingestion-sources")
              .download(filePath);
              
            if (downloadErr) throw downloadErr;
            if (fileData) {
              const arrayBuffer = await fileData.arrayBuffer();
              buffer = Buffer.from(arrayBuffer);
              mimeType = fileData.type || "image/jpeg";
              if (actualSourceDocumentUrl.toLowerCase().endsWith(".pdf")) {
                mimeType = "application/pdf";
              }
            }
          }
        } catch (fetchErr) {
          console.error(`Failed to download invoice image from storage path: ${filePath}`, fetchErr);
        }
      }

      if (documentType === "recipe") {
        parsedData = await this.visionService.processRecipe(buffer, rawText, mimeType);
      } else if (documentType === "invoice") {
        parsedData = await this.visionService.processInvoice(buffer, rawText, mimeType);
      } else {
        throw new Error(`Unsupported document type: ${documentType}`);
      }

      this.gateway.emitJobStateChange(organizationId, "vision_extraction_complete", { jobId: job.id, parsedData });
      this.gateway.emitJobStateChange(organizationId, "rosetta_mapping_complete", { jobId: job.id });

      // 3. Save Ingestion Review
      if (job.data.reviewId) {
        const updatePayload: any = {
          raw_text: rawText,
          parsed_data: parsedData,
          status: "PENDING",
          source_document_url: actualSourceDocumentUrl || null
        };
        if (sourceName) updatePayload.source_name = sourceName;

        await supabase.from("ingestion_reviews").update(updatePayload).eq("id", job.data.reviewId);
      } else {
        const insertPayload: any = {
          organization_id: organizationId,
          user_id: userId,
          source,
          raw_text: rawText,
          parsed_data: parsedData,
          status: "PENDING",
          source_document_url: actualSourceDocumentUrl || null
        };
        if (sourceName) insertPayload.source_name = sourceName;

        const { error } = await supabase.from("ingestion_reviews").insert(insertPayload);
        if (error) throw new Error(`Failed to save ingestion review: ${error.message}`);
      }

      this.gateway.emitJobStateChange(organizationId, "awaiting_review", { jobId: job.id, reviewId: job.data.reviewId });

      const { error: notifError } = await supabase.from("notifications").insert({
        organization_id: organizationId,
        user_id: userId,
        type: "INGESTION_COMPLETE",
        title: "Ingestion Ready for Review",
        message: `Your imported document from ${source} has been parsed.`,
        link: job.data.reviewId ? `/ingestion/review/${job.data.reviewId}` : `/ingestion`,
      });

      if (notifError) console.error("Failed to create notification:", notifError);
      
      this.gateway.emitJobStateChange(organizationId, "completed", { jobId: job.id });
    } catch (err: any) {
      console.error(`AI Ingestion job failed (Attempt ${job.attemptsMade + 1}/${job.opts.attempts || 1}) for review ID ${job.data.reviewId || "unknown"}:`, err);
      
      this.gateway.emitJobStateChange(organizationId, "failed", { jobId: job.id, error: err.message });
      
      const maxAttempts = job.opts.attempts || 1;
      const willRetry = job.attemptsMade + 1 < maxAttempts;
      
      if (job.data.reviewId) {
        await supabase.from("ingestion_reviews").update({
          parsed_data: { error: err.message || "Failed to process ingestion" },
          status: willRetry ? "PENDING" : "FAILED",
          source_document_url: actualSourceDocumentUrl || null
        }).eq("id", job.data.reviewId);
      }
      
      // If we don't want to retry non-transient errors, we could throw an UnrecoverableError,
      // but BullMQ will naturally exhaust attempts. For now, just throw the error.
      throw err;
    }

    return { success: true };
  }
}
