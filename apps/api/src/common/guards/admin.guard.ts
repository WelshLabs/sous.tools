import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // In a real scenario we'd decode JWT or rely on auth middleware to set request.user
    const user = request.user;

    // Check if the user has an admin role
    if (user && user.role === "admin") {
      return true;
    }

    throw new ForbiddenException("Admin access required");
  }
}
