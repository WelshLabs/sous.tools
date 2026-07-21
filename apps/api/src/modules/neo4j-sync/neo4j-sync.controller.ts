import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { Neo4jSyncService, SupabaseWebhookPayload } from "./neo4j-sync.service";
import { config } from "@soustools/config";

@Controller("webhooks/neo4j-sync")
export class Neo4jSyncController {
  private readonly logger = new Logger(Neo4jSyncController.name);

  constructor(private readonly neo4jSyncService: Neo4jSyncService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: SupabaseWebhookPayload,
    @Headers("x-supabase-signature") signature: string,
  ): Promise<{ success: boolean }> {
    this.logger.log(
      `Received Neo4j sync webhook request for table: ${payload?.table}`,
    );

    // Strictly enforce signature unless running in mock environment
    if (!config.IS_MOCK_ENV) {
      if (!signature || signature !== config.SUPABASE_WEBHOOK_SECRET) {
        this.logger.warn(`Unauthorized sync attempt. Signature mismatch.`);
        throw new UnauthorizedException("Invalid webhook signature");
      }
    }

    try {
      await this.neo4jSyncService.handleWebhook(payload);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error processing Neo4j sync webhook payload: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
