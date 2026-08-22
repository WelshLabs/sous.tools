import { Public } from "../../core/decorators/public.decorator";
import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
  NotFoundException,
  Param,
} from "@nestjs/common";

import { type Request } from "express";

import { InjectQueue } from "@nestjs/bullmq";

import { Queue } from "bullmq";

import { supabase } from "../../core/database/supabase";

import { SquareDriver } from "./drivers/square/square.driver";

import { IPosDriver } from "./drivers/pos-driver.interface";

@Public()
@Controller("integrations/webhooks")
export class PosWebhookController {
  private readonly logger = new Logger(PosWebhookController.name);

  constructor(
    @InjectQueue("pos-sync") private readonly posSyncQueue: Queue,
    private readonly squareDriver: SquareDriver,
  ) {}

  private getDriver(provider: string): IPosDriver {
    const p = provider.toLowerCase();
    if (p === "square") {
      return this.squareDriver;
    }
    throw new NotFoundException(`Unsupported provider webhook: ${provider}`);
  }

  @Post(":provider")
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param("provider") provider: string,
    @Headers("x-square-hmacsha256-signature") squareSignature: string,
    @Headers("x-square-signature") squareAltSignature: string,
    @Req() req: Request,
  ): Promise<{ status: string }> {
    const driver = this.getDriver(provider);
    const signature = squareSignature || squareAltSignature;

    interface RequestWithRawBody extends Request {
      rawBody?: Buffer;
    }
    const rawReq = req as RequestWithRawBody;
    const rawBody = rawReq.rawBody ? rawReq.rawBody.toString("utf-8") : "";

    this.logger.log(`Received Webhook for provider: ${provider}`);

    let rawPayload: Record<string, unknown> = {};
    try {
      rawPayload = JSON.parse(rawBody || "{}");
    } catch {
      throw new UnauthorizedException("Invalid JSON payload");
    }

    const normalized = driver.normalizeWebhookEvent(rawPayload);

    if (!normalized.eventId) {
      this.logger.warn(
        `Missing event_id in webhook payload. Returning 200 to satisfy provider verification.`,
      );
      return { status: "ignored" };
    }

    // 1. Idempotency Check
    const { data: existingEvent } = await supabase
      .from("processed_webhook_events")
      .select("event_id")
      .eq("event_id", normalized.eventId)
      .maybeSingle();

    if (existingEvent) {
      this.logger.log(
        `Duplicate event detected. Event ID: ${normalized.eventId}. Returning 200 early.`,
      );
      return { status: "duplicate_ignored" };
    }

    if (!normalized.merchantId) {
      this.logger.warn(
        `Invalid ${provider} webhook payload: missing merchant_id. Returning 200 to satisfy provider verification.`,
      );
      return { status: "ignored" };
    }

    // Resolve the organization that owns this merchant ID.
    // All current rows store merchantId in metadata (populated by the OAuth
    // callback). The `settings` column does NOT exist in the integrations
    // schema — the previous fallback to settings->>'merchant_id' was dead code
    // that silently swallowed errors. Migration 00006 backfills any legacy rows.
    const providerKey = provider.toUpperCase();

    type IntegrationRow = {
      organization_id: string;
      metadata: Record<string, unknown>;
    };

    const { data: integration, error: integrationErr } = await supabase
      .from("integrations")
      .select("organization_id, metadata")
      .eq("provider", providerKey)
      .eq("metadata->>merchantId", normalized.merchantId)
      .maybeSingle<IntegrationRow>();

    if (integrationErr) {
      this.logger.error(
        `DB error looking up ${provider} integration for merchant ${normalized.merchantId}: ${integrationErr.message}`,
      );
    }

    if (!integration) {
      this.logger.warn(
        `No integration found for ${provider} merchant ID ${normalized.merchantId}. ` +
          `If this merchant has connected via OAuth, re-authenticate to refresh the metadata. ` +
          `Returning 200 to satisfy provider verification.`,
      );
      return { status: "ignored" };
    }

    const orgId = integration.organization_id;
    const metadata = (integration.metadata || {}) as Record<string, unknown>;

    // Verify signature via driver interface.
    // webhook_signature_key can be optionally stored in metadata; otherwise
    // the driver falls back to the global SQUARE_WEBHOOK_SIGNATURE_KEY env var.
    const signatureKey = metadata.webhook_signature_key as string | undefined;
    const isValidSignature = driver.verifyWebhookSignature(
      signature,
      rawBody,
      signatureKey,
    );

    if (!isValidSignature) {
      this.logger.warn(`Signature verification failed for ${provider} webhook`);
      throw new UnauthorizedException("Invalid webhook signature");
    }

    // 2. Persist event ID for idempotency before processing
    await supabase
      .from("processed_webhook_events")
      .insert({ event_id: normalized.eventId, provider: providerKey });

    // 3. Queue normalized job in BullMQ
    this.logger.log(`Queueing pos-sync job for organization ${orgId}`);
    await this.posSyncQueue.add("pos-sync-job", {
      orgId,
      type: "webhook-inventory",
      eventType: normalized.eventType,
      payload: normalized.data,
    });

    return { status: "queued" };
  }
}
