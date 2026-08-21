import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  BadRequestException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { IngestionService, IngestionReviewPayload } from "./ingestion.service";
import type { ManualCorrectionDelta } from "@soustools/api-types";

@Controller("ingestion")
export class IngestionController {
  constructor(
    @InjectQueue("ingestion") private readonly ingestionQueue: Queue,
    private readonly ingestionService: IngestionService,
  ) {}

  @Post("upload")
  async handleUpload(
    @Body()
    body: {
      source?: string;
      sourceName?: string;
      sourceDocumentUrl?: string;
      pagesInput?: Array<{
        pageNumber: number;
        imageUrl?: string;
        rawText?: string;
      }>;
      conversationId?: string;
    },
    @Headers("x-org-id") orgHeader?: string,
  ) {
    const orgId = orgHeader || "d0000000-0000-0000-0000-000000000000";

    const reviewRecord = await this.ingestionService.createReviewRecord({
      organizationId: orgId,
      source: body.source || "upload",
      sourceName: body.sourceName || "Uploaded File",
      sourceDocumentUrl: body.sourceDocumentUrl,
      parsedData: { pages: [], processing: true } as any,
    });

    const job = await this.ingestionQueue.add("process-document", {
      organizationId: orgId,
      source: body.source || "upload",
      sourceName: body.sourceName || "Uploaded File",
      sourceDocumentUrl: body.sourceDocumentUrl,
      pagesInput: body.pagesInput,
      reviewId: reviewRecord.id,
      conversationId: body.conversationId,
    });

    return {
      success: true,
      jobId: job.id,
      message: "Document ingestion queued successfully.",
      reviewId: reviewRecord.id,
    };
  }

  @Get("review/:id")
  async getReview(@Param("id") id: string) {
    return this.ingestionService.getReviewRecord(id);
  }

  @Patch("review/:id")
  async updateReview(
    @Param("id") id: string,
    @Body() body: { parsedData: IngestionReviewPayload },
  ) {
    if (!body.parsedData) {
      throw new BadRequestException("parsedData is required");
    }
    return this.ingestionService.updateReviewRecordState(id, body.parsedData);
  }

  @Post("commit")
  async commitReview(
    @Body()
    body: {
      reviewId: string;
      approvedPayload: IngestionReviewPayload;
    },
    @Headers("x-org-id") orgHeader?: string,
    @Headers("x-user-id") userHeader?: string,
  ) {
    if (!body.reviewId || !body.approvedPayload) {
      throw new BadRequestException(
        "reviewId and approvedPayload are required",
      );
    }
    const orgId = orgHeader || "d0000000-0000-0000-0000-000000000000";
    return this.ingestionService.commitReviewPayload(
      body.reviewId,
      body.approvedPayload,
      orgId,
      userHeader,
    );
  }

  @Post("correction")
  async submitCorrection(
    @Body() correction: ManualCorrectionDelta,
    @Headers("x-org-id") orgHeader?: string,
  ) {
    if (!correction.rawInput || !correction.correctedExtraction) {
      throw new BadRequestException(
        "rawInput and correctedExtraction are required",
      );
    }
    const orgId =
      orgHeader ||
      correction.organizationId ||
      "d0000000-0000-0000-0000-000000000000";
    correction.organizationId = orgId;
    const result =
      await this.ingestionService.recordManualCorrection(correction);
    return {
      success: true,
      data: result,
      message: "Human correction delta captured and stored successfully.",
    };
  }

  @Get("few-shot-examples")
  async getFewShotExamples(
    @Query("documentType") documentType?: string,
    @Query("vendorId") vendorId?: string,
    @Query("vendorName") vendorName?: string,
    @Headers("x-org-id") orgHeader?: string,
  ) {
    const orgId = orgHeader || "d0000000-0000-0000-0000-000000000000";
    const promptSection = await this.ingestionService.getFewShotExamples({
      organizationId: orgId,
      documentType,
      vendorId,
      vendorName,
    });
    return { success: true, promptSection };
  }

  @Get("unmapped-report")
  async getUnmappedDataReport(@Headers("x-org-id") orgHeader?: string) {
    const orgId = orgHeader || undefined;
    return this.ingestionService.aggregateRawUnmappedData(orgId);
  }

  @Post("trigger-unmapped-cron")
  async triggerUnmappedAggregation() {
    await this.ingestionService.handleWeeklyRawUnmappedCron();
    return {
      success: true,
      message: "Weekly raw_unmapped_data aggregation triggered successfully.",
    };
  }
}
