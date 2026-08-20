import { Command, CommandRunner } from "nest-commander";
import { Logger } from "@nestjs/common";
import { EnvironmentService } from "../../environment/environment.service";

@Command({
  name: "pm2:restart",
  aliases: ["pm2-restart"],
  arguments: "[target]",
  description: "Restart PM2 managed processes (default: all)",
})
export class Pm2RestartCommand extends CommandRunner {
  private readonly logger = new Logger(Pm2RestartCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const target = passedParams[0] || "all";
    this.logger.log(`Restarting PM2 process(es): ${target}...`);
    await this.envService.spawnInteractive("pm2", ["restart", target]);
  }
}
