import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import { EnvironmentService } from '../../environment/environment.service';

@Command({
  name: 'pm2:dev',
  aliases: ['pm2-dev', 'pm2:start'],
  description:
    'Start PM2 development processes defined in ecosystem.config.cjs',
})
export class Pm2DevCommand extends CommandRunner {
  private readonly logger = new Logger(Pm2DevCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(): Promise<void> {
    const root = this.envService.getSousRoot();
    const ecosystemPath = path.join(root, 'ecosystem.config.cjs');

    this.logger.log(`Starting PM2 development apps (${ecosystemPath})...`);
    await this.envService.spawnInteractive('pm2', ['start', ecosystemPath]);
  }
}
