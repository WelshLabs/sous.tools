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

const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.IS_SECURE_ENV,
  sameSite: "lax" as const,
  path: "/",
});

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
  logout(@Res({ passthrough: true }) res: Response): ApiResponse<null> {
    const options = getCookieOptions();
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: options.path });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: options.path });
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
