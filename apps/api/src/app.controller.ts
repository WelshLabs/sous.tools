import { Controller, Get, Post, Body, Res, HttpCode, UnauthorizedException } from "@nestjs/common";
import type { Response } from "express";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AppService } from "./app.service";

import { type ApiResponse, type HelloResponse, LoginSchema } from "@soustools/api-types";

import { config } from "@soustools/config";
import { supabase } from "./lib/supabase";

const COOKIE_NAME = "sb-session-token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  // Only enforce Secure in real (non-mock) environments — mock/local dev uses plain HTTP
  secure: !config.IS_MOCK_ENV,
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in ms
  path: "/",
};


/**
 * Controller handling root application routes.
 */
@Controller()
export class AppController {
  /**
   * Initializes the controller with the application service.
   *
   * @param {AppService} appService The application service logic provider.
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint exposing the root GET path.
   *
   * Renders the standard workspace-defined ApiResponse wrapping HelloResponse.
   *
   * @returns {ApiResponse<HelloResponse>} A structured API response.
   */
  @Get()
  getHello(): ApiResponse<HelloResponse> {
    const helloData = this.appService.getHelloData();
    return {
      success: true,
      data: helloData,
      timestamp: new Date().toISOString(),
    };
  }

  @Get("favicon.ico")
  getFavicon(@Res() res: Response) {
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64",
    );
    res.type("image/png").send(pixel);
  }

  @Get("notifications/unread")
  getUnreadNotifications(): ApiResponse<any[]> {
    return {
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Authenticates a user with email + password via Supabase Auth.
   * On success, sets an HttpOnly session cookie and returns the user profile.
   * The frontend never sees or handles the raw Supabase token.
   */
  @Post("auth/login")
  @HttpCode(200)
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

    // Set HttpOnly cookie — the frontend never touches the raw token
    res.cookie(COOKIE_NAME, data.session.access_token, COOKIE_OPTIONS);

    return {
      success: true,
      data: { user: data.user as unknown as Record<string, unknown> },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Destroys the session by clearing the HttpOnly session cookie.
   */
  @Post("auth/logout")
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response): ApiResponse<null> {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return {
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
