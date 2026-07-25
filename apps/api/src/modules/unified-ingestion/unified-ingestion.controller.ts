import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  BadRequestException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  UnifiedIngestionService,
  IngestionReviewPayload,
} from "./unified-ingestion.service";

@Controller("unified-ingestion")
export class UnifiedIngestionController {
  constructor(
    @InjectQueue("unified-ingestion") private readonly ingestionQueue: Queue,
    private readonly ingestionService: UnifiedIngestionService
  ) {}

  @Post("upload")
  async handleUpload(
    @Body()
    body: {
      source?: string;
      sourceName?: string;
      sourceDocumentUrl?: string;
      pagesInput?: Array<{ pageNumber: number; imageUrl?: string; rawText?: string }>;
    },
    @Headers("x-org-id") orgHeader?: string
  ) {
    const orgId = orgHeader || "d0000000-0000-0000-0000-000000000000";

    const job = await this.ingestionQueue.add("process-document", {
      organizationId: orgId,
      source: body.source || "upload",
      sourceName: body.sourceName || "Uploaded File",
      sourceDocumentUrl: body.sourceDocumentUrl,
      pagesInput: body.pagesInput,
    });

    return { success: true, jobId: job.id, message: "Document ingestion queued successfully." };
  }

  @Get("review/:id")
  async getReview(@Param("id") id: string) {
    return this.ingestionService.getReviewRecord(id);
  }

  @Post("commit")
  async commitReview(
    @Body()
    body: {
      reviewId: string;
      approvedPayload: IngestionReviewPayload;
    },
    @Headers("x-org-id") orgHeader?: string
  ) {
    if (!body.reviewId || !body.approvedPayload) {
      throw new BadRequestException("reviewId and approvedPayload are required");
    }
    const orgId = orgHeader || "d0000000-0000-0000-0000-000000000000";
    return this.ingestionService.commitReviewPayload(body.reviewId, body.approvedPayload, orgId);
  }
}
