import { Command, CommandRunner, Option } from "nest-commander";
import { Logger } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import { EnvironmentService } from "../../environment/environment.service";

interface ProdSshOptions {
  identity?: string;
  host?: string;
  user?: string;
}

@Command({
  name: "prod:ssh",
  aliases: ["prod-ssh"],
  description: "SSH into the production Oracle Cloud server",
})
export class ProdSshCommand extends CommandRunner {
  private readonly logger = new Logger(ProdSshCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(_params: string[], options?: ProdSshOptions): Promise<void> {
    const root = this.envService.getSousRoot();
    const identityPath =
      options?.identity || path.join(root, "ssh-key.key");
    const host = options?.host || "129.158.244.62";
    const user = options?.user || "ubuntu";

    if (!fs.existsSync(identityPath)) {
      this.logger.error(`SSH private key not found at: ${identityPath}`);
      return;
    }

    this.logger.log(`Connecting to production server at ${user}@${host}...`);
    await this.envService.spawnInteractive("ssh", [
      "-i",
      identityPath,
      `${user}@${host}`,
    ]);
  }

  @Option({
    flags: "-i, --identity <path>",
    description: "Path to SSH private key file",
  })
  parseIdentity(val: string): string {
    return val;
  }

  @Option({
    flags: "-h, --host <host>",
    description: "Production host IP or hostname",
  })
  parseHost(val: string): string {
    return val;
  }

  @Option({
    flags: "-u, --user <user>",
    description: "SSH username",
  })
  parseUser(val: string): string {
    return val;
  }
}
