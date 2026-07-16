import { NextResponse, type NextRequest } from "next/server";
import { config as appConfig } from "@soustools/config";

// Must match ACCESS_TOKEN_COOKIE in apps/api/src/modules/auth/auth.controller.ts
// @todo: extract to a shared @soustools/auth-constants package
const SESSION_COOKIE = "sb-access-token";

/**
 * Middleware proxy that enforces authentication for protected routes.
 *
 * Auth strategy: check for the presence of the HttpOnly session cookie set by
 * the NestJS API on login. The cookie's *validity* is verified by the NestJS
 * SupabaseAuthGuard on every actual data request — we do not re-validate it
 * here to avoid either leaking Supabase into the frontend or adding a network
 * round-trip on every page load.
 */
export async function proxy(request: NextRequest) {
  // Public routes that don't require authentication
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes("."); // static files

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Bypass auth in mock environments (e.g., local testing)
  if (appConfig.IS_MOCK_ENV) {
    return NextResponse.next();
  }

  // Check for the HttpOnly session cookie set by the NestJS API on login
  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    const url = new URL("/login", request.url);
    url.searchParams.set("returnTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
