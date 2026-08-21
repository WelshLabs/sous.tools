import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Optional,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import {
  SupabaseService,
  supabase as globalSupabase,
} from "../database/supabase";
import { ClsService } from "nestjs-cls";

const COOKIE_NAME = "sb-access-token";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    @Optional() private readonly supabaseService?: SupabaseService,
    @Optional() private readonly cls?: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request =
      (context.getType() as string) === "graphql"
        ? GqlExecutionContext.create(context).getContext()?.req
        : context.switchToHttp().getRequest();

    if (!request) {
      throw new UnauthorizedException("No request context found");
    }

    let token: string | undefined;

    const authHeader = request.headers?.authorization as string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (request.cookies?.[COOKIE_NAME]) {
      token = request.cookies[COOKIE_NAME] as string;
    }

    if (!token) {
      throw new UnauthorizedException("No authentication token provided");
    }

    const client = this.supabaseService?.client || globalSupabase;
    const {
      data: { user },
      error,
    } = await client.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    request.user = user;

    const orgId =
      user.user_metadata?.organization_id ||
      request.headers?.["x-org-id"] ||
      request.headers?.["x-organization-id"] ||
      request.query?.orgId;

    if (orgId && this.cls) {
      this.cls.set("orgId", orgId);
    }
    if (user.id && this.cls) {
      this.cls.set("userId", user.id);
    }

    return true;
  }
}
