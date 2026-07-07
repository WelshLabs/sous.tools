import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards, Logger, UsePipes } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsSupabaseAuthGuard } from '../../lib/ws-supabase-auth.guard';
import { CommandsService } from './commands.service';
import { OmnibarCommandPayload, OmnibarCommandPayloadSchema } from '@soustools/api-types';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@WebSocketGateway({ namespace: '/commands', cors: { origin: '*' } })
export class CommandsGateway {
  private readonly logger = new Logger(CommandsGateway.name);

  constructor(private readonly commandsService: CommandsService) {}

  @UseGuards(WsSupabaseAuthGuard)
  @UsePipes(new ZodValidationPipe(OmnibarCommandPayloadSchema))
  @SubscribeMessage('executeCommand')
  async handleExecuteCommand(
    @MessageBody() payload: OmnibarCommandPayload,
    @ConnectedSocket() client: Socket & { user?: any },
  ) {
    this.logger.log(`Received command via WebSocket: ${payload.command}`);
    
    // orgId from authenticated user
    const orgId = client.user?.user_metadata?.organization_id || "d0000000-0000-0000-0000-000000000000";

    // Emitter callback
    const emitState = (state: string, message: string) => {
      client.emit('command_status', { state, message });
    };

    try {
      emitState('processing_nlp', 'Authenticating...');
      
      const result = await this.commandsService.handleCommand(payload, orgId, emitState);
      
      client.emit('command_status', {
        state: result.action === 'ERROR' ? 'error' : 'success',
        message: result.message,
        data: result,
      });
    } catch (error: any) {
      this.logger.error('Error executing command', error);
      client.emit('command_status', {
        state: 'error',
        message: error.message || 'An unexpected error occurred while executing the command',
      });
    }
  }
}
