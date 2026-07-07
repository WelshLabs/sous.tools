import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsSupabaseAuthGuard } from '../../lib/ws-supabase-auth.guard';
import { CommandsService } from './commands.service';
import { OmnibarCommandPayload, OmnibarCommandPayloadSchema, OmniMessage } from '@soustools/api-types';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@WebSocketGateway({ namespace: '/commands', cors: { origin: '*' } })
export class CommandsGateway {
  private readonly logger = new Logger(CommandsGateway.name);

  constructor(private readonly commandsService: CommandsService) {}

  @UseGuards(WsSupabaseAuthGuard)
  @SubscribeMessage('executeCommand')
  async handleExecuteCommand(
    @MessageBody(new ZodValidationPipe(OmnibarCommandPayloadSchema)) payload: OmnibarCommandPayload,
    @ConnectedSocket() client: Socket & { user?: any },
  ) {
    this.logger.log(`Received chat history via WebSocket (${payload.chatHistory?.length || 0} messages)`);
    
    // orgId from authenticated user
    const orgId = client.user?.user_metadata?.organization_id || "d0000000-0000-0000-0000-000000000000";

    // Emitter callback for real-time ReAct loop
    const emitMessage = (message: OmniMessage) => {
      client.emit('chat_message', message);
    };

    try {
      await this.commandsService.handleCommand(payload, orgId, emitMessage);
    } catch (error: any) {
      this.logger.error('Error processing command stream', error);
      client.emit('command_status', {
        state: 'error',
        message: error.message || 'An unexpected error occurred while executing the command',
      });
    }
  }
}
