import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request =
      (context.getType() as string) === "graphql"
        ? GqlExecutionContext.create(context).getContext()?.req
        : context.switchToHttp().getRequest();

    const user = request?.user;
    if (!user) {
      throw new ForbiddenException("No user found in request");
    }

    const userRole = user.user_metadata?.role || "user";
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(`Require one of roles: ${requiredRoles.join(", ")}`);
    }

    return true;
  }
}
