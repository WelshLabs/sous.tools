import { Resolver, Mutation, Context, Args } from "@nestjs/graphql";
import { Public } from "../../core/decorators/public.decorator";
import { UnauthorizedException } from "@nestjs/common";
import { supabase } from "../../core/database/supabase";
import {
  setSessionCookies,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getCookieOptions,
} from "./auth.controller";
import { serverConfig as config } from "@soustools/config/server";
import { Request, Response } from "express";

@Resolver()
export class AuthResolver {
  @Public()
  @Mutation(() => Boolean)
  async refreshSession(
    @Context() context: { req: Request; res: Response },
  ): Promise<boolean> {
    let refreshToken = (context.req?.cookies as Record<string, string>)?.[
      REFRESH_TOKEN_COOKIE
    ];

    if (!refreshToken && typeof context.req?.headers?.cookie === "string") {
      const match = context.req.headers.cookie.match(
        new RegExp(`(?:^|;\\s*)${REFRESH_TOKEN_COOKIE}=([^;]+)`),
      );
      if (match) {
        refreshToken = decodeURIComponent(match[1]);
      }
    }

    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token found");
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException("Session refresh failed");
    }

    if (context.res) {
      setSessionCookies(context.res, data.session, context.req);
    }
    return true;
  }

  @Public()
  @Mutation(() => Boolean)
  async logout(
    @Context() context: { req: Request; res: Response },
  ): Promise<boolean> {
    let accessToken = (context.req?.cookies as Record<string, string>)?.[
      ACCESS_TOKEN_COOKIE
    ];

    if (!accessToken && typeof context.req?.headers?.cookie === "string") {
      const match = context.req.headers.cookie.match(
        new RegExp(`(?:^|;\\s*)${ACCESS_TOKEN_COOKIE}=([^;]+)`),
      );
      if (match) {
        accessToken = decodeURIComponent(match[1]);
      }
    }

    if (accessToken) {
      try {
        await supabase.auth.admin.signOut(accessToken);
      } catch {
        // Non-fatal
      }
    }

    if (context.res) {
      const options = getCookieOptions(context.req);
      context.res.clearCookie(ACCESS_TOKEN_COOKIE, options);
      context.res.clearCookie(REFRESH_TOKEN_COOKIE, options);
    }
    return true;
  }

  @Public()
  @Mutation(() => Boolean)
  async forgotPassword(@Args("email") email: string): Promise<boolean> {
    const redirectTo = `${config.NEXT_PUBLIC_APP_URL}/reset-password`;
    try {
      await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    } catch {
      // Silently swallowed
    }
    return true;
  }
}
