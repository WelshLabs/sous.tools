import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  HttpCode,
  UnauthorizedException,
} from "@nestjs/common";
import type { Response } from "express";
import { ApiTags, ApiBody, ApiResponse as NestjsApiResponse, ApiProperty } from "@nestjs/swagger";
import { type ApiResponse, LoginSchema } from "@soustools/api-types";
import { supabase } from "../../lib/supabase";
import { config } from "@soustools/config";

const ACCESS_TOKEN_COOKIE = "sb-access-token";
const REFRESH_TOKEN_COOKIE = "sb-refresh-token";

/**
 * Returns cookie options appropriate for the current environment.
 *
 * KEY RULE: `clearCookie` MUST be called with the same `domain`, `path`,
 * `secure`, and `sameSite` values that were used when the cookie was set,
 * otherwise the browser will not match and delete the cookie.
 *
 * In production (behind Traefik on *.sous.tools) we set `Domain: .sous.tools`
 * so the same cookie is visible to both `app.sous.tools` and `api.sous.tools`.
 * In development we omit `domain` so the cookie is scoped to localhost.
 */
const getCookieOptions = () => {
  const isSecureEnv = config.IS_PRODUCTION || config.IS_SECURE_ENV || process.env.NODE_ENV === "staging";
  return {
    httpOnly: true,
    secure: isSecureEnv,
    sameSite: "lax" as const,
    path: "/",
    ...(isSecureEnv ? { domain: ".sous.tools" } : {}),
  };
};

class LoginDto {
  @ApiProperty()
  email!: string;
  @ApiProperty()
  password!: string;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  @Post("login")
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @NestjsApiResponse({ status: 200, description: "Success", schema: { type: "object", additionalProperties: true } })
  async login(
    @Body() body: Record<string, unknown>,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<{ user: Record<string, unknown> }>> {
    
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      throw new UnauthorizedException("Invalid request body");
    }

    const { email, password } = parsed.data;
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error || !data.session) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const options = getCookieOptions();
    res.cookie(ACCESS_TOKEN_COOKIE, data.session.access_token, {
      ...options,
      maxAge: data.session.expires_in * 1000,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, data.session.refresh_token, {
      ...options,
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    return {
      success: true,
      data: { user: data.user as unknown as Record<string, unknown> },
      timestamp: new Date().toISOString(),
    };
  }

  @Post("refresh")
  @HttpCode(200)
  @NestjsApiResponse({ status: 200, description: "Success", schema: { type: "object", additionalProperties: true } })
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<null>> {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token found");
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException("Session refresh failed");
    }

    const options = getCookieOptions();
    res.cookie(ACCESS_TOKEN_COOKIE, data.session.access_token, {
      ...options,
      maxAge: data.session.expires_in * 1000,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, data.session.refresh_token, {
      ...options,
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    return {
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post("logout")
  @HttpCode(200)
  @NestjsApiResponse({ status: 200, description: "Success", schema: { type: "object", additionalProperties: true } })
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<null>> {
    // Attempt to invalidate the Supabase session server-side using the
    // access token stored in the HttpOnly cookie.
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
    if (accessToken) {
      try {
        await supabase.auth.admin.signOut(accessToken);
      } catch {
        // Non-fatal: the tokens may already be expired. We still clear the cookies.
      }
    }

    // IMPORTANT: clearCookie MUST receive the exact same domain, path, secure,
    // and sameSite attributes as the original Set-Cookie call. If any attribute
    // differs, the browser will not find a matching cookie to delete.
    const options = getCookieOptions();
    res.clearCookie(ACCESS_TOKEN_COOKIE, options);
    res.clearCookie(REFRESH_TOKEN_COOKIE, options);

    return {
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Get("session")
  @NestjsApiResponse({ status: 200, description: "Success", schema: { type: "object", additionalProperties: true } })
  async getSession(
    @Req() req: any,
  ): Promise<ApiResponse<{ user: Record<string, unknown> | null }>> {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
    if (!token) {
      return {
        success: true,
        data: { user: null },
        timestamp: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return {
        success: true,
        data: { user: null },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: { user: data.user as unknown as Record<string, unknown> },
      timestamp: new Date().toISOString(),
    };
  }
}
