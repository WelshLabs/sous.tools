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
import { supabase } from "../../lib/supabase";
import { SquareDriver } from "./drivers/square/square.driver";
import { IPosDriver } from "./drivers/pos-driver.interface";

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

    // Resolve organization associated with this Provider Merchant.
    // Try canonical metadata->>'merchantId' first, then fall back to
    // settings->>'merchant_id' for rows created before the metadata fix.
    const providerKey = provider.toUpperCase();

    type IntegrationRow = {
      organization_id: string;
      settings: Record<string, unknown>;
      metadata: Record<string, unknown>;
    };

    let integration: IntegrationRow | null = null;

    const { data: byMetadata, error: metaErr } = await supabase
      .from("integrations")
      .select("organization_id, settings, metadata")
      .eq("provider", providerKey)
      .eq("metadata->>merchantId", normalized.merchantId)
      .maybeSingle();

    if (!metaErr && byMetadata) {
      integration = byMetadata as IntegrationRow;
    } else {
      // Fallback: legacy rows may have stored merchant_id in settings only
      const { data: bySettings, error: settingsErr } = await supabase
        .from("integrations")
        .select("organization_id, settings, metadata")
        .eq("provider", providerKey)
        .eq("settings->>merchant_id", normalized.merchantId)
        .maybeSingle();

      if (!settingsErr && bySettings) {
        integration = bySettings as IntegrationRow;
        // Backfill metadata.merchantId so future lookups hit the fast path
        await supabase
          .from("integrations")
          .update({
            metadata: {
              ...(bySettings.metadata as Record<string, unknown>),
              merchantId: normalized.merchantId,
            },
          })
          .eq("organization_id", bySettings.organization_id)
          .eq("provider", providerKey);
        this.logger.log(
          `Backfilled metadata.merchantId for org ${bySettings.organization_id}`,
        );
      }
    }

    if (!integration) {
      this.logger.warn(
        `No integration found for ${provider} merchant ID ${normalized.merchantId}. Returning 200 to satisfy provider verification.`,
      );
      return { status: "ignored" };
    }

    const orgId = integration.organization_id;
    const settings = (integration.settings || {}) as Record<string, unknown>;

    // Verify signature via driver interface
    const signatureKey = settings.webhook_signature_key as string | undefined;
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
