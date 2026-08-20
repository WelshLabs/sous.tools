import { Command, CommandRunner } from "nest-commander";
import { Logger } from "@nestjs/common";
import { EnvironmentService } from "../../environment/environment.service";

@Command({
  name: "db:push",
  aliases: ["db-push"],
  description: "Push Supabase migrations to remote/local database",
})
export class DbPushCommand extends CommandRunner {
  private readonly logger = new Logger(DbPushCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log("Executing Supabase DB push...");
    const exitCode = await this.envService.spawnInteractive("npx", [
      "supabase",
      "db",
      "push",
    ]);
    if (exitCode === 0) {
      this.logger.log("✅ Supabase migrations pushed successfully.");
    } else {
      this.logger.error(`Supabase DB push exited with code ${exitCode}.`);
    }
  }
}
