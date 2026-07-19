"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { config } from "@soustools/config";

export async function logoutAction() {
  // Forward the user's HttpOnly session cookies to the NestJS API so it can
  // identify and invalidate the correct Supabase session server-side.
  // Without this, the fetch call is anonymous and clearCookie is a no-op.
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    await fetch(
      `${config.API_BASE_URL}/auth/logout`,
      {
        method: "POST",
        headers: {
          // Pass the browser cookies so NestJS can read and clear them.
          Cookie: cookieHeader,
        },
      },
    );
  } catch (error) {
    // Non-fatal — still redirect to login so the user is not stuck.
    console.error("Logout API call failed", error);
  }

  // Redirect to login regardless of API outcome.
  redirect("/login");
}
