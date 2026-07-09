import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { supabase } from "./supabase";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException("No authorization header found");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedException("No token provided");
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
