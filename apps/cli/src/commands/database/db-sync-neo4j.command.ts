import { Command, CommandRunner, Option } from "nest-commander";
import { Logger } from "@nestjs/common";
import { serverConfig as config } from "@soustools/config/server";
import { EnvironmentService } from "../../environment/environment.service";

interface DbSyncNeo4jOptions {
  url?: string;
  table?: string;
  secret?: string;
}

@Command({
  name: "db:sync-neo4j",
  aliases: ["sync-neo4j"],
  description: "Trigger Neo4j graph synchronization with PostgreSQL schema & records",
})
export class DbSyncNeo4jCommand extends CommandRunner {
  private readonly logger = new Logger(DbSyncNeo4jCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: DbSyncNeo4jOptions,
  ): Promise<void> {
    const defaultHost = this.envService.isDocker()
      ? "http://api:3001/webhooks/neo4j-sync"
      : "http://localhost:3001/webhooks/neo4j-sync";
    const syncUrl = options?.url || defaultHost;
    const table = options?.table || "all";
    const secret = options?.secret || config.SUPABASE_WEBHOOK_SECRET;

    this.logger.log(
      `Triggering Neo4j synchronization at: ${syncUrl} (table: ${table})...`,
    );

    const payload = {
      type: "UPDATE",
      table: table === "all" ? "schema_sync" : table,
      schema: "public",
      record: { sync_triggered_by: "sous-cli", timestamp: new Date().toISOString() },
      old_record: null,
    };

    try {
      const response = await fetch(syncUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-supabase-signature": secret,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        this.logger.error(
          `Sync request returned HTTP ${response.status}: ${errorText}`,
        );
        return;
      }

      const result = (await response.json().catch(() => ({ success: true }))) as Record<string, unknown>;
      this.logger.log(
        `✅ Neo4j sync completed successfully: ${JSON.stringify(result)}`,
      );
    } catch (err) {
      this.logger.warn(
        `⚠️ Could not contact sync webhook directly (${(err as Error).message}).`,
      );
      this.logger.log(
        "Ensure apps/api is running to handle real-time sync, or trigger via migration prepare-seed script.",
      );
    }
  }

  @Option({
    flags: "-u, --url <url>",
    description: "Target Neo4j sync webhook URL",
  })
  parseUrl(val: string): string {
    return val;
  }

  @Option({
    flags: "-t, --table <table>",
    description: "Specific table to synchronize",
  })
  parseTable(val: string): string {
    return val;
  }

  @Option({
    flags: "-s, --secret <secret>",
    description: "Webhook authorization signature secret",
  })
  parseSecret(val: string): string {
    return val;
  }
}
