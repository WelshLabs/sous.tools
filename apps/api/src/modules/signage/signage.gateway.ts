import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class SignageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    const displayId = client.handshake.query.displayId;
    if (displayId && typeof displayId === "string") {
      client.join(`display:${displayId}`);
    }
  }

  handleDisconnect(_client: Socket): void {
    // No-op
  }

  @SubscribeMessage("join")
  handleJoin(
    client: Socket,
    payload: { displayId?: string; id?: string },
  ): { status: string; joined?: string } {
    const id = payload?.displayId || payload?.id;
    if (id) {
      client.join(`display:${id}`);
      return { status: "success", joined: `display:${id}` };
    }
    return { status: "error" };
  }

  broadcastLayoutUpdate(displayId: string): void {
    if (this.server) {
      this.server
        .to(`display:${displayId}`)
        .emit("layout_updated", { displayId });
    }
  }
}
