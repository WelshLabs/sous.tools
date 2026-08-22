import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { Public } from "../../core/decorators/public.decorator";

// Temporary fallback - Edge tokens might be validated differently later
@Public()
@WebSocketGateway({ namespace: "/edge", cors: true })
export class EdgeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EdgeGateway.name);

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token) {
      this.logger.warn(`Edge Node failed to connect (no token)`);
      client.disconnect();
      return;
    }
    this.logger.log(`Edge Node connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Edge Node disconnected: ${client.id}`);
  }

  @SubscribeMessage("printer_discovered")
  handlePrinterDiscovered(
    @MessageBody() payload: { ip: string; name: string },
    @ConnectedSocket() _client: Socket,
  ) {
    this.logger.log(
      `Edge Node discovered printer ${payload.name} at ${payload.ip}`,
    );
    // Future: Persist this to Postgres `devices` table or `locations`
  }

  @SubscribeMessage("print_job_failed")
  handlePrintJobFailed(
    @MessageBody() payload: { ip: string; error: string },
    @ConnectedSocket() _client: Socket,
  ) {
    this.logger.error(
      `Print job failed on printer ${payload.ip}: ${payload.error}`,
    );
  }

  @SubscribeMessage("print_job_success")
  handlePrintJobSuccess(
    @MessageBody() payload: { ip: string },
    @ConnectedSocket() _client: Socket,
  ) {
    this.logger.log(`Print job succeeded on printer ${payload.ip}`);
  }

  // Callable method to dispatch jobs to edge nodes
  dispatchPrintJob(ip: string, type: "receipt" | "kds", lines: string[]) {
    this.server.emit("print_job", { ip, type, lines });
  }
}
