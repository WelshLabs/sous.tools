"use server";

import { redirect } from "next/navigation";

export async function logoutAction() {
  // Hit the NestJS API to securely destroy the session on the server
  try {
    await fetch(`${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/logout`, {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout API failed", error);
  }

  // Redirect to login regardless
  redirect("/login");
}
