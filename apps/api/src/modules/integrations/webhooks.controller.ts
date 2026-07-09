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
import { type Queue } from "bullmq";
import * as crypto from "crypto";
import { config } from "@soustools/config";
import { supabase } from "../../lib/supabase";

interface WebhookPayload {
  merchant_id?: string;
  type?: string;
  event_id?: string;
  created_at?: string;
  data?: {
    id: string;
    object: Record<string, unknown>;
  };
}

@Controller("integrations/webhooks")
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(@InjectQueue("pos-sync") private readonly posSyncQueue: Queue) {}

  @Post(":provider")
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param("provider") provider: string,
    @Headers("x-square-hmacsha256-signature") squareSignature: string,
    @Headers("x-square-signature") squareAltSignature: string,
    @Req() req: Request,
  ): Promise<{ status: string }> {
    const signature = squareSignature || squareAltSignature;
    interface RequestWithRawBody extends Request {
      rawBody?: Buffer;
    }
    const rawReq = req as RequestWithRawBody;
    const rawBody = rawReq.rawBody ? rawReq.rawBody.toString("utf-8") : "";

    this.logger.log(`Received Webhook for provider: ${provider}`);

    if (provider.toLowerCase() === "square") {
      return this.handleSquare(signature, rawBody);
    } else {
      throw new NotFoundException(`Unsupported provider webhook: ${provider}`);
    }
  }

  private async handleSquare(
    signature: string,
    rawBody: string,
  ): Promise<{ status: string }> {
    const payload = JSON.parse(rawBody) as WebhookPayload;
    const eventId = payload.event_id;
    const merchantId = payload.merchant_id;

    if (!eventId) {
      throw new UnauthorizedException("Missing event_id in webhook payload");
    }

    // 1. Idempotency Check
    const { data: existingEvent } = await supabase
      .from("processed_webhook_events")
      .select("event_id")
      .eq("event_id", eventId)
      .maybeSingle();

    if (existingEvent) {
      this.logger.log(
        `Duplicate event detected. Event ID: ${eventId}. Returning 200 early.`,
      );
      return { status: "duplicate_ignored" };
    }

    if (!merchantId) {
      throw new UnauthorizedException(
        "Invalid Square webhook payload: missing merchant_id",
      );
    }

    // Resolve organization associated with this Square Merchant
    const { data: integration, error } = await supabase
      .from("integrations")
      .select("organization_id, settings")
      .eq("provider", "SQUARE")
      .eq("settings->>merchant_id", merchantId)
      .maybeSingle();

    if (error || !integration) {
      this.logger.warn(
        `No integration found for Square merchant ID ${merchantId}`,
      );
      throw new NotFoundException(
        `No integration found for merchant: ${merchantId}`,
      );
    }

    const orgId = integration.organization_id;
    const settings = (integration.settings || {}) as Record<string, unknown>;

    // Verify signature strictly if key is configured, fallback to tenant's key
    const signatureKey =
      (settings.webhook_signature_key as unknown as string) ||
      config.SQUARE_WEBHOOK_SIGNATURE_KEY;
    const notificationUrl = `${config.API_BASE_URL}/integrations/webhooks/square`;

    if (!config.IS_MOCK_ENV && signatureKey) {
      if (!signature) {
        throw new UnauthorizedException("Missing Square signature header");
      }
      const hash = crypto
        .createHmac("sha256", String(signatureKey))
        .update(notificationUrl + rawBody)
        .digest("base64");

      if (hash !== signature) {
        this.logger.warn(
          `Signature mismatch. Computed: ${hash}, received: ${signature}`,
        );
        throw new UnauthorizedException("Invalid webhook signature");
      }
    }

    // 2. Persist event ID for idempotency before processing
    await supabase
      .from("processed_webhook_events")
      .insert({ event_id: eventId, provider: "SQUARE" });

    // Queue catalog/inventory sync
    this.logger.log(`Queueing pos-sync job for organization ${orgId}`);
    await this.posSyncQueue.add("pos-sync-job", {
      orgId,
      type: "webhook-inventory",
      payload: payload.data as unknown as Record<string, unknown>,
    });

    return { status: "queued" };
  }
}
