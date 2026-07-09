import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { supabase } from "./supabase";

const COOKIE_NAME = "sb-session-token";

/**
 * Guard that validates a Supabase JWT from either:
 *  1. The `Authorization: Bearer <token>` header (API-to-API or mobile clients)
 *  2. The `sb-session-token` HttpOnly cookie (browser clients)
 *
 * On success, populates `request.user` with the authenticated Supabase user.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Prefer Authorization header; fall back to HttpOnly cookie
    let token: string | undefined;

    const authHeader = request.headers.authorization as string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (request.cookies?.[COOKIE_NAME]) {
      token = request.cookies[COOKIE_NAME] as string;
    }

    if (!token) {
      throw new UnauthorizedException("No authentication token provided");
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    request.user = user;
    return true;
  }
}
