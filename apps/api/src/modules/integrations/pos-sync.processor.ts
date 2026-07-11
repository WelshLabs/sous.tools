import { Processor, WorkerHost } from "@nestjs/bullmq";
import { type Job } from "bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { type IntegrationsService } from "./integrations.service";

/**
 * BullMQ processor for handling POS catalog and inventory synchronization tasks.
 */
@Processor("pos-sync")
@Injectable()
export class PosSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(PosSyncProcessor.name);

  constructor(private readonly service: IntegrationsService) {
    super();
  }

  async process(
    job: Job<{
      orgId: string;
      type: "sync-catalog" | "webhook-inventory";
      payload?: Record<string, unknown>;
    }>,
  ): Promise<void> {
    const { orgId, type } = job.data;
    this.logger.log(
      `Processing job ${job.id} of type ${type} for org ${orgId}`,
    );

    if (type === "sync-catalog") {
      await this.service.syncSquareCatalog(orgId);
    } else if (type === "webhook-inventory") {
      // Instantly run catalog and inventory sync when webhook signals inventory change
      await this.service.syncSquareCatalog(orgId);
    }
  }
}
