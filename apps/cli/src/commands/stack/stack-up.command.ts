import { Command, CommandRunner, Option } from "nest-commander";
import { Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { EnvironmentService } from "../../environment/environment.service";

interface StackUpOptions {
  prod?: boolean;
  env?: string;
  projectId?: string;
}

@Command({
  name: "stack:up",
  aliases: ["up", "stack-up"],
  description: "Start Docker Compose stack with Infisical secrets injection",
})
export class StackUpCommand extends CommandRunner {
  private readonly logger = new Logger(StackUpCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(_params: string[], options?: StackUpOptions): Promise<void> {
    const root = this.envService.getSousRoot();
    const envFile = path.join(root, ".env");
    const isProd = options?.prod ?? false;

    if (isProd) {
      this.logger.log("Starting production Docker Compose profile...");
      await this.envService.spawnInteractive("docker", [
        "compose",
        "--profile",
        "prod",
        "up",
        "-d",
      ]);
      return;
    }

    const envName = options?.env || "dev";
    const projectId = options?.projectId || "";

    this.logger.log(`Starting stack for environment: ${envName}...`);

    if (projectId) {
      await this.envService.spawnInteractive("infisical", [
        "run",
        `--env=${envName}`,
        `--projectId=${projectId}`,
        "--",
        "docker",
        "compose",
        "up",
        "-d",
      ]);
    } else if (fs.existsSync(envFile)) {
      await this.envService.spawnInteractive("docker", [
        "compose",
        "--env-file",
        envFile,
        "up",
        "-d",
      ]);
    } else {
      await this.envService.spawnInteractive("docker", ["compose", "up", "-d"]);
    }
  }

  @Option({
    flags: "-p, --prod",
    description: "Start with production profile enabled",
  })
  parseProd(): boolean {
    return true;
  }

  @Option({
    flags: "-e, --env <env>",
    description: "Infisical environment (dev, staging, prod)",
  })
  parseEnv(val: string): string {
    return val;
  }

  @Option({
    flags: "--projectId <id>",
    description: "Infisical Project ID",
  })
  parseProjectId(val: string): string {
    return val;
  }
}
