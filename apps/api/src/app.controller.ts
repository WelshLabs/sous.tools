import { Controller, Get, Post, Body, Res, HttpCode, UnauthorizedException, UseGuards, Req } from "@nestjs/common";
import type { Response } from "express";
import { AppService } from "./app.service";
import { type ApiResponse, type HelloResponse, LoginSchema } from "@soustools/api-types";
import { config } from "@soustools/config";
import { supabase } from "./lib/supabase";
import { SupabaseAuthGuard } from "./lib/supabase-auth.guard";
import { randomUUID } from "crypto";

const COOKIE_NAME = "sb-session-token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  // Only enforce Secure in production — local dev/testing uses plain HTTP
  secure: config.IS_PRODUCTION,
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
   * Generates a signed upload URL for direct client-side storage uploads.
   * Prevents proxying large binary data payloads through the NestJS server.
   */
  @Post("storage/upload-url")
  @UseGuards(SupabaseAuthGuard)
  async getUploadUrl(
    @Body() body: { fileName: string },
    @Req() req: any,
  ): Promise<ApiResponse<{ signedUrl: string; publicUrl: string; filePath: string }>> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException("User not authenticated");
    }

    const fileId = randomUUID();
    const fileName = body?.fileName || "file.bin";
    const ext = fileName.split(".").pop() || "bin";
    const filePath = `${user.id}/${fileId}.${ext}`;

    const { data, error } = await supabase.storage
      .from("ingestion-sources")
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      throw new Error(error?.message || "Failed to create signed upload URL");
    }

    const { data: publicUrlData } = supabase.storage
      .from("ingestion-sources")
      .getPublicUrl(filePath);

    return {
      success: true,
      data: {
        signedUrl: data.signedUrl,
        publicUrl: publicUrlData.publicUrl,
        filePath,
      },
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

  /**
   * Returns current session information by validating the sb-session-token cookie.
   */
  @Get("auth/session")
  async getSession(@Req() req: any): Promise<ApiResponse<{ user: Record<string, unknown> | null }>> {
    const token = req.cookies?.[COOKIE_NAME];
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

