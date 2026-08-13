import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";

@WebSocketGateway({ cors: { origin: "*" }, namespace: "/pos" })
export class PosGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(PosGateway.name);

  handleConnection(client: Socket): void {
    const orgId = client.handshake.query.orgId as string;
    if (orgId) {
      client.join(`org:${orgId}`);
      this.logger.log(`Client ${client.id} joined org:${orgId}`);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage("join")
  handleJoin(
    client: Socket,
    payload: { orgId: string },
  ): { status: string; joined?: string[] } {
    if (payload?.orgId) {
      client.join(`org:${payload.orgId}`);
      return { status: "success", joined: [`org:${payload.orgId}`] };
    }
    return { status: "error" };
  }

  broadcastCatalogUpdate(orgId: string): void {
    if (this.server) {
      this.server.to(`org:${orgId}`).emit("catalog_updated", { orgId });
      this.logger.log(`Emitted catalog_updated for org:${orgId}`);
    }
  }

  broadcastOrdersUpdate(orgId: string): void {
    if (this.server) {
      this.server.to(`org:${orgId}`).emit("orders_updated", { orgId });
      this.logger.log(`Emitted orders_updated for org:${orgId}`);
    }
  }
}
