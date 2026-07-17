import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class AllWsExceptionsFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(AllWsExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    
    this.logger.error('WebSocket Exception:', exception);
    
    const errorMsg = exception instanceof Error ? exception.message : 'Internal server error';

    client.emit('exception', {
      state: 'error',
      message: errorMsg,
    });
  }
}
