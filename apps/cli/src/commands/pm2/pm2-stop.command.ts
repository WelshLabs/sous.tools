import { Command, CommandRunner } from "nest-commander";
import { Logger } from "@nestjs/common";
import { EnvironmentService } from "../../environment/environment.service";

@Command({
  name: "pm2:stop",
  aliases: ["pm2-stop"],
  arguments: "[target]",
  description: "Stop PM2 managed processes (default: all)",
})
export class Pm2StopCommand extends CommandRunner {
  private readonly logger = new Logger(Pm2StopCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const target = passedParams[0] || "all";
    this.logger.log(`Stopping PM2 process(es): ${target}...`);
    await this.envService.spawnInteractive("pm2", ["stop", target]);
  }
}
