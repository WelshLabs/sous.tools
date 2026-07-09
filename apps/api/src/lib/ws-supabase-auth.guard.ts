import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { supabase } from "./supabase";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsSupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    let token = client.handshake?.auth?.token || client.handshake?.headers?.authorization;
    
    if (token && token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    if (!token && client.handshake?.headers?.cookie) {
      const match = client.handshake.headers.cookie.match(/sb-session-token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      throw new WsException("Unauthorized: No token provided");
    }


    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new WsException("Unauthorized: Invalid or expired token");
    }

    client.user = user;
    return true;
  }
}
