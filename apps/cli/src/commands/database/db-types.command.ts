import { Command, CommandRunner, Option } from "nest-commander";
import { Logger } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import { EnvironmentService } from "../../environment/environment.service";

interface DbTypesOptions {
  projectId?: string;
  output?: string;
}

@Command({
  name: "db:types",
  aliases: ["db-types"],
  description: "Generate TypeScript types from Supabase database schema",
})
export class DbTypesCommand extends CommandRunner {
  private readonly logger = new Logger(DbTypesCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(_params: string[], options?: DbTypesOptions): Promise<void> {
    const projectId = options?.projectId || "";
    const root = this.envService.getSousRoot();
    const outputPath =
      options?.output ||
      path.join(root, "packages/supabase/src/database.types.ts");

    this.logger.log("Generating Supabase TypeScript definitions...");

    const args = ["supabase", "gen", "types", "typescript"];
    if (projectId) {
      args.push("--project-id", projectId);
    } else {
      args.push("--local");
    }

    try {
      const typesOutput = this.envService.execSync(`npx ${args.join(" ")}`);
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outputPath, typesOutput, "utf8");
      this.logger.log(`✅ Types successfully generated at: ${outputPath}`);
    } catch (err) {
      this.logger.error(
        `Failed to generate Supabase types: ${(err as Error).message}`,
      );
    }
  }

  @Option({
    flags: "-p, --project-id <id>",
    description: "Supabase project ID (defaults to local if not provided)",
  })
  parseProjectId(val: string): string {
    return val;
  }

  @Option({
    flags: "-o, --output <path>",
    description: "Target filepath for generated TypeScript types",
  })
  parseOutput(val: string): string {
    return val;
  }
}
