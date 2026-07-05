import { Injectable, Logger } from '@nestjs/common';
import { OmnibarCommandPayload } from '@soustools/api-types';

@Injectable()
export class CommandsService {
  private readonly logger = new Logger(CommandsService.name);

  async handleCommand(payload: OmnibarCommandPayload) {
    this.logger.log(`\n🤖 AI COMMAND RECEIVED [${payload.source}]: ${payload.command}`);
    if (payload.context) {
      this.logger.log(`Context: ${JSON.stringify(payload.context)}`);
    }

    return {
      action: 'ACKNOWLEDGED',
      message: 'Yes Chef.',
    };
  }
}
