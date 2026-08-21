import { Command, CommandRunner } from 'nest-commander';
import { EnvironmentService } from '../../environment/environment.service';

@Command({
  name: 'pm2:status',
  aliases: ['pm2-status'],
  description: 'Display PM2 process manager status table',
})
export class Pm2StatusCommand extends CommandRunner {
  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(): Promise<void> {
    await this.envService.spawnInteractive('pm2', ['status']);
  }
}
