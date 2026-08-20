import { Command, CommandRunner, Option } from "nest-commander";
import { Logger } from "@nestjs/common";
import { EnvironmentService } from "../../environment/environment.service";

interface StackLogsOptions {
  tail?: string;
  noFollow?: boolean;
}

@Command({
  name: "stack:logs",
  aliases: ["logs", "dlogs", "stack-logs"],
  arguments: "[service]",
  description: "Stream logs from Docker Compose services (e.g. api, traefik, litellm, n8n, cptr, code-server)",
})
export class StackLogsCommand extends CommandRunner {
  private readonly logger = new Logger(StackLogsCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: StackLogsOptions,
  ): Promise<void> {
    const [service] = passedParams;
    const args = ["compose", "logs"];

    if (!options?.noFollow) {
      args.push("-f");
    }

    if (options?.tail) {
      args.push("--tail", options.tail);
    }

    if (service) {
      args.push(service);
      this.logger.log(`Tailing logs for service: ${service}...`);
    } else {
      this.logger.log("Tailing logs for all stack services...");
    }

    await this.envService.spawnInteractive("docker", args);
  }

  @Option({
    flags: "-t, --tail <lines>",
    description: "Number of lines to show from the end of the logs",
  })
  parseTail(val: string): string {
    return val;
  }

  @Option({
    flags: "--no-follow",
    description: "Do not follow log output",
  })
  parseNoFollow(): boolean {
    return true;
  }
}
