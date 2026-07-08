import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ingestion',
})
export class IngestionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private logger: Logger = new Logger('IngestionGateway');

  afterInit(_server: Server) {
    this.logger.log('IngestionGateway initialized');
  }

  handleConnection(client: Socket, ..._args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    const orgId = client.handshake.query.orgId as string;
    if (orgId) {
      client.join(orgId);
      this.logger.log(`Client ${client.id} joined room ${orgId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitJobStateChange(orgId: string, state: string, data?: any) {
    this.server.to(orgId).emit('job_state_change', {
      state,
      data,
      timestamp: new Date(),
    });
  }
}
