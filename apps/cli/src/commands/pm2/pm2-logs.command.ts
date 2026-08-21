import { Command, CommandRunner } from 'nest-commander';
import { EnvironmentService } from '../../environment/environment.service';

@Command({
  name: 'pm2:logs',
  aliases: ['pm2-logs'],
  arguments: '[target]',
  description: 'Show live logs for PM2 processes',
})
export class Pm2LogsCommand extends CommandRunner {
  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const target = passedParams[0];
    const args = ['logs'];
    if (target) {
      args.push(target);
    }
    await this.envService.spawnInteractive('pm2', args);
  }
}
