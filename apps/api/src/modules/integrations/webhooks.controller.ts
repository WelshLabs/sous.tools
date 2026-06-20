import { Controller, Post, Headers, Req, HttpCode, HttpStatus, UnauthorizedException, Logger, NotFoundException } from "@nestjs/common";
import { Request } from "express";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import * as crypto from "crypto";
import { config } from "@soustools/config";
import { supabase } from "../../lib/supabase";

interface SquareWebhookPayload {
  merchant_id: string;
  type: string;
  event_id: string;
  created_at: string;
  data: {
    id: string;
    object: Record<string, unknown>;
  };
}

/**
 * Controller to handle real-time webhook updates from third-party POS providers.
 */
@Controller("integrations/webhooks")
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(@InjectQueue("pos-sync") private readonly posSyncQueue: Queue) {}

  @Post("square")
  @HttpCode(HttpStatus.OK)
  async handleSquareWebhook(
    @Headers("x-square-hmacsha256-signature") signature: string,
    @Req() req: Request
  ): Promise<{ status: string }> {
    interface RequestWithRawBody extends Request {
      rawBody?: Buffer;
    }
    const rawReq = req as RequestWithRawBody;
    const rawBody = rawReq.rawBody ? rawReq.rawBody.toString("utf-8") : "";
    const notificationUrl = `${config.API_BASE_URL}/integrations/webhooks/square`;

    this.logger.log(`Received Square Webhook notification. Signature length: ${signature?.length || 0}`);

    // Verify signature strictly if key is configured and not in mock env
    const signatureKey = config.SQUARE_WEBHOOK_SIGNATURE_KEY;
    if (!config.IS_MOCK_ENV && signatureKey) {
      if (!signature) {
        throw new UnauthorizedException("Missing Square signature header");
      }
      const hash = crypto
        .createHmac("sha256", signatureKey)
        .update(notificationUrl + rawBody)
        .digest("base64");
      
      if (hash !== signature) {
        this.logger.warn(`Signature mismatch. Computed: ${hash}, received: ${signature}`);
        throw new UnauthorizedException("Invalid webhook signature");
      }
    } else {
      this.logger.warn("Bypassing Square webhook signature verification (dev/mock environment or missing key).");
    }

    const payload = JSON.parse(rawBody) as SquareWebhookPayload;
    const merchantId = payload.merchant_id;
    if (!merchantId) {
      throw new UnauthorizedException("Invalid Square webhook payload: missing merchant_id");
    }

    // Resolve organization associated with this Square Merchant
    const { data: integration, error } = await supabase
      .from("integrations")
      .select("organization_id")
      .eq("provider", "SQUARE")
      .eq("metadata->>merchantId", merchantId)
      .maybeSingle();

    if (error || !integration) {
      this.logger.warn(`No integration found for Square merchant ID ${merchantId}`);
      throw new NotFoundException(`No integration found for merchant: ${merchantId}`);
    }

    const orgId = integration.organization_id;

    // Queue catalog/inventory sync
    this.logger.log(`Queueing pos-sync job for organization ${orgId}`);
    await this.posSyncQueue.add("pos-sync-job", {
      orgId,
      type: "webhook-inventory",
      payload: payload.data as unknown as Record<string, unknown>
    });

    return { status: "queued" };
  }
}
