import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SignageLayoutConfig } from "@soustools/api-types";

interface JoinPayload {
  displayId?: string;
  deckId?: string;
  id?: string;
}

@WebSocketGateway({ cors: { origin: "*" } })
export class SignageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    const { displayId, deckId } = client.handshake.query;
    if (displayId && typeof displayId === "string") {
      client.join(`display:${displayId}`);
    }
    if (deckId && typeof deckId === "string") {
      client.join(`deck:${deckId}`);
    }
  }

  handleDisconnect(_client: Socket): void {
    // No-op — socket.io auto-removes from rooms on disconnect
  }

  @SubscribeMessage("join")
  handleJoin(
    client: Socket,
    payload: JoinPayload,
  ): { status: string; joined?: string[] } {
    const joined: string[] = [];
    const displayId = payload?.displayId ?? payload?.id;
    const deckId = payload?.deckId;

    if (displayId) {
      client.join(`display:${displayId}`);
      joined.push(`display:${displayId}`);
    }
    if (deckId) {
      client.join(`deck:${deckId}`);
      joined.push(`deck:${deckId}`);
    }
    return joined.length ? { status: "success", joined } : { status: "error" };
  }

  /**
   * Broadcasts a full deck config update to all clients subscribed to that deck.
   * Called after a deck save or a POS item change affecting this deck.
   */
  broadcastDeckUpdate(deckId: string, config: SignageLayoutConfig): void {
    if (this.server) {
      this.server
        .to(`deck:${deckId}`)
        .emit("deck_updated", { deckId, config });
    }
  }

  /** @deprecated Use broadcastDeckUpdate instead. Kept for transition compatibility. */
  broadcastLayoutUpdate(displayId: string): void {
    if (this.server) {
      this.server
        .to(`display:${displayId}`)
        .emit("layout_updated", { displayId });
    }
  }

  /** Broadcasts all updated POS items to clients subscribed to a deck room. */
  broadcastItemsUpdate(deckId: string, items: any[]): void {
    if (this.server) {
      this.server
        .to(`deck:${deckId}`)
        .emit("items_updated", { deckId, items });
    }
  }
}
